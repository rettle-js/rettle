import { RettleConfigInterface } from "./config";
import { Plugin } from "vite";
export declare const viteRettlePlugin: (c: {
    root: RettleConfigInterface<any>["root"];
    static: RettleConfigInterface<any>["static"];
    pathPrefix: RettleConfigInterface<any>["pathPrefix"];
    dynamicRoutes: RettleConfigInterface<any>["dynamicRoutes"];
    js: RettleConfigInterface<any>["js"];
    template: RettleConfigInterface<any>["template"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    define: RettleConfigInterface<any>["define"];
    beautify: RettleConfigInterface<any>["beautify"];
    endpoints: RettleConfigInterface<any>["endpoints"];
}) => Plugin;
