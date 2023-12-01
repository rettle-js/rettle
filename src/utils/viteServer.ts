import { RettleConfigInterface } from "./config";
import { createServer } from "vite";
import { viteRettlePlugin } from "./viteRettlePlugin";
import { viteAdditionalStaticPlugin } from "./viteAdditionalStaticPlugin";

export const wakeupViteServer = async (options: {
  server: RettleConfigInterface<any>["server"];
  static: RettleConfigInterface<any>["static"];
  pathPrefix: RettleConfigInterface<any>["pathPrefix"];
  define: RettleConfigInterface<any>["define"];
  root: RettleConfigInterface<any>["root"];
  dynamicRoutes: RettleConfigInterface<any>["dynamicRoutes"];
  js: RettleConfigInterface<any>["js"];
  template: RettleConfigInterface<any>["template"];
  version: RettleConfigInterface<any>["version"];
  header: RettleConfigInterface<any>["header"];
  esbuild: RettleConfigInterface<any>["esbuild"];
  beautify: RettleConfigInterface<any>["beautify"];
  endpoints: RettleConfigInterface<any>["endpoints"];
}) => {
  const vite = await createServer({
    plugins: [
      viteAdditionalStaticPlugin({
        server: options.server,
      }),
      viteRettlePlugin({
        root: options.root,
        static: options.static,
        pathPrefix: options.pathPrefix,
        dynamicRoutes: options.dynamicRoutes,
        js: options.js,
        template: options.template,
        version: options.version,
        header: options.header,
        esbuild: options.esbuild,
        define: options.define,
        beautify: options.beautify,
        endpoints: options.endpoints,
      }),
    ],
    server: {
      port: options.server.port,
      host: options.server.host,
      watch: {
        usePolling: true,
      },
    },
    publicDir: options.static,
    base: options.pathPrefix,
    define: {
      "process.env": JSON.stringify(process.env),
      define: JSON.stringify(options.define),
    },
  });
  await vite.listen();
  vite.printUrls();
};
