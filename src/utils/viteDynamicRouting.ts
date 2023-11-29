import path from "node:path";
import { RettleConfigInterface } from "./config";
import { compileDynamicTsx } from "./viteCompileTsxFile";
import * as fs from "node:fs";

type waitingConfig = {
  wait: string;
  src: string;
  id: string;
}[];

const getWaitingPath = async (c: {
  dynamicRoutes: RettleConfigInterface<any>["dynamicRoutes"];
}) => {
  const waitingData: waitingConfig = [];
  const pattern = /\[(.*?)\]/;
  if (c.dynamicRoutes) {
    type DynamicRoutesKey = keyof typeof c.dynamicRoutes;
    for (const relativePath of Object.keys(
      c.dynamicRoutes
    ) as DynamicRoutesKey[]) {
      const routeIsArray = Array.isArray(c.dynamicRoutes[relativePath]);
      const routingSetting = c.dynamicRoutes[relativePath];
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

const viteDynamicRouting = async (
  tsxPath: string,
  id: string,
  c: {
    define: RettleConfigInterface<any>["define"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    beautify: RettleConfigInterface<any>["beautify"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
    js: RettleConfigInterface<any>["js"];
    template: RettleConfigInterface<any>["template"];
  }
) => {
  if (fs.existsSync(tsxPath)) {
    try {
      const result = await compileDynamicTsx(tsxPath, id, c);
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
