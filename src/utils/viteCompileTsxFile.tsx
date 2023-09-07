import {
  createHeaders,
  createHelmet,
  transformReact2HTMLCSS,
  transformReact2HTMLCSSDynamic,
} from "./HTMLBuilder";
import { checkEndpoint } from "./utility";
import path from "path";
import { config } from "./config";

const compileTsx = (tsxPath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { html, css, ids } = await transformReact2HTMLCSS(tsxPath);
      const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
      const helmet = createHelmet();
      const headers = createHeaders().concat(helmet.headers);
      const endpoint = checkEndpoint(tsxPath);
      const script = path.join("/.cache/scripts", endpoint || "", config.js);
      const result = config.template({
        html,
        style,
        headers,
        script,
        helmet: helmet.attributes,
        noScript: helmet.body,
        mode: "server",
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

const compileDynamicTsx = (tsxPath: string, id: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { html, css, ids } = await transformReact2HTMLCSSDynamic(
        tsxPath,
        id
      );
      const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
      const helmet = createHelmet();
      const headers = createHeaders().concat(helmet.headers);
      const endpoint = checkEndpoint(tsxPath);
      const script = path.join("/.cache/scripts", endpoint || "", config.js);
      const result = config.template({
        html,
        style,
        headers,
        script,
        helmet: helmet.attributes,
        noScript: helmet.body,
        mode: "server",
      });
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

export { compileTsx, compileDynamicTsx };
