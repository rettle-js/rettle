import path from "node:path";
import * as glob from "glob";
import { config } from "./config";
import { compileDynamicTsx } from "./viteCompileTsxFile";
import * as fs from "node:fs";

type waitingConfig = {
  wait: string;
  src: string;
  id: string;
}[];

const getWaitingPath = async () => {
  const waitingData: waitingConfig = [];
  const pattern = /\[(.*?)\]/;
  if (config.dynamicRoutes) {
    type DynamicRoutesKey = keyof typeof config.dynamicRoutes;
    for (const relativePath of Object.keys(
      config.dynamicRoutes
    ) as DynamicRoutesKey[]) {
      const routeIsArray = Array.isArray(config.dynamicRoutes[relativePath]);
      const routingSetting = config.dynamicRoutes[relativePath];
      const requestData = routeIsArray
        ? (routingSetting as string[])
        : ((await (routingSetting as () => Promise<string[]>)()) as string[]);
      for (const key of requestData) {
        const id = `[${relativePath.match(pattern)![1]}]`;
        const exName = path.extname(relativePath);
        const resolvePath = path.resolve(
          relativePath.replace(id, key).replace(exName, ".html")
        );
        waitingData.push({
          wait: resolvePath,
          src: relativePath,
          id: key,
        });
      }
    }
  }
  return waitingData;
};

const checkDynamicRoute = (requestHTML: string, config: waitingConfig) => {
  for (const conf of config) {
    if (requestHTML === conf.wait) {
      return conf;
    }
  }
  return false;
};

const viteDynamicRouting = async (tsxPath: string, id: string) => {
  if (fs.existsSync(tsxPath)) {
    try {
      const result = await compileDynamicTsx(tsxPath, id);
      return await Promise.resolve(result);
    } catch (e) {
      return await Promise.reject(e);
    }
  } else {
    return await Promise.reject();
  }
};

export {
  viteDynamicRouting,
  checkDynamicRoute,
  getWaitingPath,
  type waitingConfig,
};
