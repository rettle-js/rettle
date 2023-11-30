import { RettleConfigInterface } from "./config";
declare const compileTsx: (tsxPath: string, c: {
    js: RettleConfigInterface<any>["js"];
    template: RettleConfigInterface<any>["template"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    define: RettleConfigInterface<any>["define"];
    beautify: RettleConfigInterface<any>["beautify"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
}) => Promise<string>;
declare const compileDynamicTsx: (tsxPath: string, id: string, c: {
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
export { compileTsx, compileDynamicTsx };
