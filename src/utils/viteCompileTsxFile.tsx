import {
  createHeaders,
  createHelmet,
  transformReact2HTMLCSS,
  transformReact2HTMLCSSDynamic,
} from "./HTMLBuilder";
import { checkEndpoint } from "./utility";
import path from "path";
import { RettleConfigInterface } from "./config";

const compileTsx = (
  tsxPath: string,
  c: {
    js: RettleConfigInterface<any>["js"];
    template: RettleConfigInterface<any>["template"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    define: RettleConfigInterface<any>["define"];
    beautify: RettleConfigInterface<any>["beautify"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
  }
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { html, css, ids } = await transformReact2HTMLCSS(tsxPath, {
        esbuild: c.esbuild,
        define: c.define,
        beautify: c.beautify,
      });
      const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
      const helmet = createHelmet();
      const headers = createHeaders(c.version, c.header).concat(helmet.headers);
      const endpoint = checkEndpoint(tsxPath, c.endpoints, c.root);
      const script = path.join("/.cache/scripts", endpoint || "", c.js);
      const result = c.template({
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

const compileDynamicTsx = (
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
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { html, css, ids } = await transformReact2HTMLCSSDynamic(
        tsxPath,
        id,
        {
          define: c.define,
          esbuild: c.esbuild,
          beautify: c.beautify,
        }
      );
      const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
      const helmet = createHelmet();
      const headers = createHeaders(c.version, c.header).concat(helmet.headers);
      const endpoint = checkEndpoint(tsxPath, c.endpoints, c.root);
      const script = path.join("/.cache/scripts", endpoint || "", c.js);
      const result = c.template({
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
