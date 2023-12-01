import viteRettlePluginServer from "./vitePlugins/server";
import viteRettlePluginBuild from "./vitePlugins/build";
import {
  BeautifyOptions,
  DynamicRoute,
  BuildOptionsInterface,
} from "./utils/config";
import { templateHTMLInterface } from "./utils/template.html";
import { defaultConfig } from "./utils/defaultConfigure";
import deepmerge from "deepmerge";

export interface RettleOptions {
  beautify: Omit<BeautifyOptions, "html">;
  dynamicRoutes?: DynamicRoute;
  template: (options: templateHTMLInterface) => string;
  version: boolean;
  routes: string;
  buildHook: BuildOptionsInterface;
  hotReload?: boolean;
}

const defaultOptions: RettleOptions = {
  beautify: defaultConfig.beautify,
  dynamicRoutes: undefined,
  template: defaultConfig.template,
  version: defaultConfig.version,
  routes: "views",
  buildHook: defaultConfig.build,
  hotReload: true,
};

export default (options: Partial<RettleOptions> = {}): any[] => {
  const option = deepmerge(defaultOptions, options) as RettleOptions;
  return [viteRettlePluginBuild(option), viteRettlePluginServer(option)];
};
