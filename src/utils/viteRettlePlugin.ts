import path from "path";
import { config } from "./config";
import fs from "fs";
import { send, Plugin } from "vite";
import errorTemplateHtml, { errorTemplate } from "./errorTemplate.html";
import { compileTsx } from "./viteCompileTsxFile";
import {
  viteDynamicRouting,
  checkDynamicRoute,
  getWaitingPath,
  type waitingConfig,
} from "./viteDynamicRouting";

const errorResult = (e: any) => {
  const errorType = String(e);
  const stack = e.stack
    .split("<br/>")
    .map((item: string, i: number) => (i !== 0 ? item + "<br/>" : ""))
    .join("");
  return errorTemplateHtml(
    "Build Error",
    errorTemplate(
      `<p class="color-red">${errorType}</p><p class="pl-20">${stack}</p>`
    )
  );
};

let dynamicPaths: waitingConfig;

export const viteRettlePlugin: Plugin = {
  name: "vite-plugin-rettle",
  apply: "serve",
  async configureServer(server) {
    dynamicPaths = await getWaitingPath();
    server.middlewares.use(async (req, res, next) => {
      const root = server.config.root;
      let fullReqPath = path.join(root, config.root, req.url || "");
      let fullReqStaticPath = path.join(root, config.static, req.url || "");
      if (fullReqPath.endsWith("/")) {
        fullReqPath += "index.html";
      }
      if (fullReqStaticPath.endsWith("/")) {
        fullReqStaticPath += "index.html";
      }
      const fullReqPathWithoutPrefix = path.join(
        ...fullReqPath.split(config.pathPrefix)
      );
      if (fullReqPath.endsWith(".html")) {
        const tsxPath = `${
          fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) ||
          fullReqPath
        }.tsx`.replace(path.join(config.root, config.pathPrefix), config.root);
        if (fs.existsSync(tsxPath)) {
          try {
            const result = await compileTsx(tsxPath);
            return send(req, res, result, "html", {});
          } catch (e: any) {
            const result = errorResult(e);
            return send(req, res, result, "html", {});
          }
        } else if (checkDynamicRoute(fullReqPathWithoutPrefix, dynamicPaths)) {
          const dynamicPath = checkDynamicRoute(
            fullReqPathWithoutPrefix,
            dynamicPaths
          ) as waitingConfig[number];
          // Dynamic Routing
          try {
            const result = await viteDynamicRouting(
              dynamicPath.src,
              dynamicPath.id
            );
            return send(req, res, result, "html", {});
          } catch (e) {
            const result = errorResult(e);
            return send(req, res, result, "html", {});
          }
        } else if (fs.existsSync(fullReqStaticPath)) {
          if (req.url?.endsWith("/")) {
            req.url = req.url + "index.html";
          }
          return next();
        } else {
          const html = `<div><h1 class="title text-center">404 Page Not Found</h1></div>`;
          return send(req, res, errorTemplateHtml("", html), "html", {});
        }
      } else {
        return next();
      }
    });
  },
};
