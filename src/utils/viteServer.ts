import { config } from "./config";
import { createServer } from "vite";
import { viteRettlePlugin } from "./viteRettlePlugin";
import { viteAdditionalStaticPlugin } from "./viteAdditionalStaticPlugin";

export const wakeupViteServer = async () => {
  const vite = await createServer({
    plugins: [viteAdditionalStaticPlugin, viteRettlePlugin],
    server: {
      port: config.server.port,
      host: config.server.host,
      watch: {
        usePolling: true,
      },
    },
    publicDir: config.static,
    base: config.pathPrefix,
    define: {
      "process.env": JSON.stringify(Object.assign(process.env, config.define)),
    },
  });
  await vite.listen();
  vite.printUrls();
};
