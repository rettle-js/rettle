import path from "path";
import { RettleConfigInterface } from "./config";
import fs from "fs";
import { send, Plugin } from "vite";
import glob from "glob";
import mime from "mime-types";

const addStaticFiles: Record<string, Buffer> = {};

export const viteAdditionalStaticPlugin = (c: {
  server: RettleConfigInterface<any>["server"];
}): Plugin => {
  return {
    name: "vite-plugin-additional-static",
    apply: "serve",
    configureServer(server) {
      if (c.server.listenDir) {
        for (const dir of c.server.listenDir) {
          const listenFiles = glob.sync(path.join(dir, "/**/*"), {
            nodir: true,
          });
          for (const file of listenFiles) {
            const resolveFile = path.resolve(file);
            addStaticFiles[file] = fs.readFileSync(resolveFile);
          }
        }
      }
      server.middlewares.use(async (req, res, next) => {
        if (req.url && c.server.listenDir) {
          const requestURL = req.url.split("?")[0].split("#")[0];
          for (const dir of c.server.listenDir) {
            const requestFullFilePath = path.join(
              path.resolve(dir),
              requestURL
            );
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
};
