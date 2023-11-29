import { watchFiles } from "./watcher";
import { color } from "../utils/Log";
import {
  createCacheAppFile,
  createTsConfigFile,
  outputFormatFiles,
} from "../utils/AppScriptBuilder";
import { wakeupViteServer } from "../utils/viteServer";
import { createConfig, RettleConfigInterface } from "../utils/config";
import * as path from "path";
import glob from "glob";
import fs from "fs";
import { deleteDir } from "../utils/directoryControl";

const watchSources = (c: {
  js: RettleConfigInterface<any>["js"];
  endpoints: RettleConfigInterface<any>["endpoints"];
  root: RettleConfigInterface<any>["root"];
}) => {
  watchFiles({
    change: async (filename) => {
      try {
        console.log(color.blue(`【Change File】-> ${filename}`));
        await outputFormatFiles(filename);
        await createCacheAppFile({
          js: c.js,
          endpoints: c.endpoints,
          root: c.root,
        });
      } catch (e) {
        console.error(e);
      }
    },
    add: (filename, watcher) => {
      console.log(color.blue(`【Add File】-> ${filename}`));
      watcher.add(filename);
    },
    unlink: (filename, watcher) => {
      console.log(color.blue(`【Unlink File】-> ${filename}`));
      watcher.unwatch(filename);
    },
    unlinkDir: (filename, watcher) => {
      console.log(color.blue(`【Unlink Dir】-> ${filename}`));
      watcher.unwatch(filename);
    },
    ready: () => {},
  });
};

const resetDir = (dirRoot: string) => {
  return new Promise((resolve) => {
    if (fs.existsSync(dirRoot)) {
      deleteDir(dirRoot);
    }
    resolve(null);
  });
};

export const server = async () => {
  const config = createConfig();
  await Promise.all([
    resetDir(".cache/src"),
    resetDir(".cache/scripts"),
    resetDir(".cache/temporary"),
  ]);
  /* build app.js files */
  const buildSetupOptions = {
    outDir: path.join(".cache/temporary", config.pathPrefix),
  };
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
      js: config.js,
      endpoints: config.endpoints,
      root: config.root,
    });
  } catch (e) {
    throw e;
  }
  watchSources({
    js: config.js,
    endpoints: config.endpoints,
    root: config.root,
  });
  /* wake up html and css server */
  wakeupViteServer({
    server: config.server,
    static: config.static,
    pathPrefix: config.pathPrefix,
    define: config.define,
    root: config.root,
    dynamicRoutes: config.dynamicRoutes,
    js: config.js,
    template: config.template,
    version: config.version,
    header: config.header,
    esbuild: config.esbuild,
    beautify: config.beautify,
    endpoints: config.endpoints,
  }).then();
};
