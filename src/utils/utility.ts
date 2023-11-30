import * as path from "path";
import fs from "fs";
import { getIgnores } from "./config";
import glob from "glob";
import { RettleConfigInterface } from "./config";
import { deleteDir } from "./directoryControl";
import { watchFiles } from "../module/watcher";
import { color } from "./Log";
import { createCacheAppFile, outputFormatFiles } from "./AppScriptBuilder";

export const watchSources = (c: {
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

export const resetDir = (dirRoot: string) => {
  return new Promise((resolve) => {
    if (fs.existsSync(dirRoot)) {
      deleteDir(dirRoot);
    }
    resolve(null);
  });
};

export const mkdirp = (filePath: string) => {
  return new Promise((resolve) => {
    const dirPath =
      path.extname(filePath) !== "" ? path.dirname(filePath) : filePath;
    const parts = dirPath.split(path.sep);
    for (let i = 1; i <= parts.length; i++) {
      const currPath = path.join.apply(null, parts.slice(0, i));
      if (!fs.existsSync(currPath)) {
        fs.mkdirSync(currPath);
      }
      if (i === parts.length) {
        resolve(null);
      }
    }
  });
};

const djb2Hash = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash;
};
export const createHash = (str: string) => {
  const hash = djb2Hash(str);
  const fullStr = "0000000" + (hash & 0xffffff).toString(16);
  return fullStr.substring(fullStr.length - 8, fullStr.length);
};

export const getEntryPaths = (
  root: RettleConfigInterface<any>["root"],
  endpoints: RettleConfigInterface<any>["endpoints"]
) => {
  const entryPaths = {} as { [index: string]: string[] };
  endpoints.map((endpoint: any) => {
    const rootEndpoint = path.join(root, endpoint);
    const ignore = getIgnores(rootEndpoint, {
      endpoints: endpoints,
      root: root,
    });
    const files = glob.sync(path.join("./", rootEndpoint, "/**/*"), {
      ignore,
      nodir: true,
    });
    entryPaths[rootEndpoint] = files;
  });
  return entryPaths;
};

export const getFilesName = (filepath: string) => {
  const pathArray = filepath.split("/");
  for (let i = pathArray.length - 1; i >= 0; i--) {
    if (!pathArray[i].includes("index")) {
      return pathArray[i].replace(path.extname(filepath), "");
    }
  }
  return filepath;
};

const countSlash = (str: string) => {
  return (str.match(/\//g) || []).length;
};

export const checkEndpoint = (
  file: string,
  endpoints: RettleConfigInterface<any>["endpoints"],
  root: RettleConfigInterface<any>["root"]
) => {
  const endPoint = endpoints.sort((a: string, b: string) => {
    return countSlash(a) < countSlash(b) ? 1 : -1;
  });
  for (const ep of endPoint) {
    const rootEndpoint = path.join(root, ep);
    const absPath = path.resolve(rootEndpoint);
    const absFilePath = path.isAbsolute(file) ? file : path.resolve(file);
    if (absFilePath.includes(absPath)) {
      const fp = absPath.replace(path.resolve(root), "");
      return fp.endsWith("/") ? fp.slice(0, -1) : fp;
    }
  }
};
