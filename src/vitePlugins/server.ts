import { Plugin, UserConfig, send } from "vite";
import { RettleOptions } from "../vite";
import { watchSources } from "../utils/utility";
import { defaultConfig } from "../utils/defaultConfigure";
import * as path from "node:path";
import fs from "node:fs";
import { compileTsx } from "../utils/viteCompileTsxFile";

const viteRettlePluginServer = (option: RettleOptions): Plugin => {
  let userConfig: UserConfig;
  return {
    name: "vite-plugin-rettle",
    apply: "serve",
    handleHotUpdate(context) {
      context.server.ws.send({
        type: "full-reload",
      });
      return [];
    },
    config: async (config) => {
      userConfig = config;
      watchSources({
        js: defaultConfig.js,
        endpoints: defaultConfig.endpoints,
        root: path.join(userConfig.root || "/", option.routes),
      });
    },
    configureServer: (server) => {
      server.middlewares.use(async (req, res, next) => {
        const request = path.join(
          server.config.root,
          option.routes,
          req.url || ""
        );
        const extName = path.extname(request);
        let fullReqPath = path.join(request, extName ? "" : "index.html");

        if (fullReqPath.endsWith(".html")) {
          const tsxPath = path.join(
            ...`${
              fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) ||
              fullReqPath
            }.tsx`.split(userConfig.base || "")
          );
          if (!fs.existsSync(tsxPath)) {
            return next();
          }
          const html = await compileTsx(tsxPath, {
            js: defaultConfig.js,
            template: defaultConfig.template,
            version: option.version,
            header: defaultConfig.header,
            esbuild: defaultConfig.esbuild,
            define: userConfig.define,
            beautify: defaultConfig.beautify,
            endpoints: defaultConfig.endpoints,
            root: path.join(path.join(userConfig.root || ""), option.routes),
          });
          const result = await server.transformIndexHtml(
            fullReqPath,
            html,
            userConfig.base
          );
          return send(req, res, result, "html", {});
        }
        next();
      });
    },
  };
};

export default viteRettlePluginServer;
