import {Plugin} from "vite";
import {RettleOptions} from "../vite";

const viteRettlePluginServer = (option: RettleOptions): Plugin => ({
  name: "vite-plugin-rettle",
  apply: "serve",
  configureServer: (server) => {

  }
});

export default viteRettlePluginServer;