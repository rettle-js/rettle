import { RettleConfigInterface } from "./config";
type waitingConfig = {
    wait: string;
    src: string;
    id: string;
}[];
declare const getWaitingPath: (c: {
    dynamicRoutes: RettleConfigInterface<any>["dynamicRoutes"];
}) => Promise<waitingConfig>;
declare const checkDynamicRoute: (requestHTML: string, config: waitingConfig) => false | {
    wait: string;
    src: string;
    id: string;
};
declare const viteDynamicRouting: (tsxPath: string, id: string, c: {
    define: RettleConfigInterface<any>["define"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    beautify: RettleConfigInterface<any>["beautify"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
    js: RettleConfigInterface<any>["js"];
    template: RettleConfigInterface<any>["template"];
}) => Promise<string>;
export { viteDynamicRouting, checkDynamicRoute, getWaitingPath, type waitingConfig, };
