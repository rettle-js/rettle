import {Plugin} from "vite";
import {RettleOptions} from "../vite";

const viteRettlePluginBuild = (option: RettleOptions): Plugin => {
  return  {
    name: "vite-plugin-rettle",
    apply: "build",
    buildStart: () => {},
    config: (config) => {

    },
    resolveId: (id) => {},
    load: (id) => {}
  };
  }

export default viteRettlePluginBuild