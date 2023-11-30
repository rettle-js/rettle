import { RettleConfigInterface } from "./config";
export declare const wakeupViteServer: (options: {
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
}) => Promise<void>;
