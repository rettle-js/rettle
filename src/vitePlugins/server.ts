import { Plugin, UserConfig, send } from "vite";
import { RettleOptions } from "../vite";
import { watchSources, resetDir } from "../utils/utility";
import { defaultConfig } from "../utils/defaultConfigure";
import * as path from "node:path";
import fs from "node:fs";
import { compileTsx } from "../utils/viteCompileTsxFile";
import glob from "glob";
import {
  createCacheAppFile,
  createTsConfigFile,
  outputFormatFiles,
} from "../utils/AppScriptBuilder";
import errorTemplateHtml, { errorTemplate } from "../utils/errorTemplate.html";
import Chokidar from "chokidar";

const viteRettlePluginServer = (option: RettleOptions): Plugin => {
  let userConfig: UserConfig;
  let watcher: Chokidar.FSWatcher;
  return {
    name: "vite-plugin-rettle",
    apply: "serve",
    handleHotUpdate(context) {
      if (context.file.includes(".cache") || option.hotReload === false) {
        return [];
      }
      context.server.ws.send({
        type: "full-reload",
      });
    },
    config: async (config) => {
      userConfig = config;
      return userConfig;
    },
    buildStart: async () => {
      await Promise.all([
        resetDir(".cache/src"),
        resetDir(".cache/scripts"),
        resetDir(".cache/temporary"),
      ]);
      const srcFiles = glob.sync("./src/**/*{ts,js,tsx,jsx,json}", {
        nodir: true,
      });
      await Promise.all(
        srcFiles.map(
          (file) =>
            new Promise(async (resolve, reject) => {
              try {
                await outputFormatFiles(file);
                resolve(null);
              } catch (e) {
                reject(e);
              }
            })
        )
      );
      try {
        await createTsConfigFile();
      } catch (e) {
        throw e;
      }
      try {
        await createCacheAppFile({
          js: defaultConfig.js,
          endpoints: defaultConfig.endpoints,
          root: path.join(userConfig.root || "/", option.routes),
        });
      } catch (e) {
        throw e;
      }
      watcher = watchSources({
        js: defaultConfig.js,
        endpoints: defaultConfig.endpoints,
        root: path.join(userConfig.root || "/", option.routes),
      });
    },
    buildEnd: () => {
      watcher.close();
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
          try {
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
          } catch (e) {
            return send(
              req,
              res,
              errorTemplateHtml(
                "Build Error",
                errorTemplate(
                  `<p class="color-red">${String(
                    e
                  ).toString()}</p><p class="pl-20">${(e as Error).stack}</p>`
                )
              ),
              "html",
              {}
            );
          }
        }
        next();
      });
    },
  };
};

export default viteRettlePluginServer;
