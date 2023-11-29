import viteRettlePluginServer from "./vitePlugins/server";
import viteRettlePluginBuild from "./vitePlugins/build";
import {BeautifyOptions, DynamicRoute} from "./utils/config";
import {templateHTMLInterface} from "./utils/template.html";

export interface RettleOptions {
  beautify?: Omit<BeautifyOptions, "html">,
  dynamicRoutes?: DynamicRoute;
  template: (options: templateHTMLInterface) => string;
  version: boolean;
}

export default (options: RettleOptions) => {
  return [viteRettlePluginBuild(options), viteRettlePluginServer(options)]
}