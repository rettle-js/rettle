import * as path from "path";
import fs from "fs";
import { config, getIgnores } from "./config";
import glob from "glob";

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

export const getEntryPaths = () => {
  const entryPaths = {} as { [index: string]: string[] };
  config.endpoints.map((endpoint: any) => {
    const rootEndpoint = path.join(config.root, endpoint);
    const ignore = getIgnores(rootEndpoint);
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

export const checkEndpoint = (file: string) => {
  const endpoints = config.endpoints.sort((a: string, b: string) => {
    return countSlash(a) < countSlash(b) ? 1 : -1;
  });
  for (const ep of endpoints) {
    const rootEndpoint = path.join(config.root, ep);
    const absPath = path.resolve(rootEndpoint);
    const absFilePath = path.isAbsolute(file) ? file : path.resolve(file);
    if (absFilePath.includes(absPath)) {
      const fp = absPath.replace(path.resolve(config.root), "");
      return fp.endsWith("/") ? fp.slice(0, -1) : fp;
    }
  }
};
