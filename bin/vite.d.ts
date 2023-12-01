import { BeautifyOptions, DynamicRoute, BuildOptionsInterface } from "./utils/config";
import { templateHTMLInterface } from "./utils/template.html";
export interface RettleOptions {
    beautify: Omit<BeautifyOptions, "html">;
    dynamicRoutes?: DynamicRoute;
    template: (options: templateHTMLInterface) => string;
    version: boolean;
    routes: string;
    buildHook: BuildOptionsInterface;
    hotReload?: boolean;
}
declare const _default: (options?: Partial<RettleOptions>) => any[];
export default _default;
