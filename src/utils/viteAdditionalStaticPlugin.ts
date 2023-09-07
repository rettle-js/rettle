import path from "path";
import { config } from "./config";
import fs from "fs";
import { send, Plugin } from "vite";
import glob from "glob";
import mime from "mime-types";

const addStaticFiles: Record<string, Buffer> = {};
if (config.server.listenDir) {
  for (const dir of config.server.listenDir) {
    const listenFiles = glob.sync(path.join(dir, "/**/*"), {
      nodir: true,
    });
    for (const file of listenFiles) {
      const resolveFile = path.resolve(file);
      addStaticFiles[file] = fs.readFileSync(resolveFile);
    }
  }
}

export const viteAdditionalStaticPlugin: Plugin = {
  name: "vite-plugin-additional-static",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && config.server.listenDir) {
        const requestURL = req.url.split("?")[0].split("#")[0];
        for (const dir of config.server.listenDir) {
          const requestFullFilePath = path.join(path.resolve(dir), requestURL);
          if (addStaticFiles[requestFullFilePath]) {
            const type = mime.lookup(requestURL);
            return send(req, res, addStaticFiles[requestFullFilePath], "", {
              headers: {
                "Content-Type": String(type),
              },
            });
          }
        }
      } else {
        next();
      }
    });
  },
};
