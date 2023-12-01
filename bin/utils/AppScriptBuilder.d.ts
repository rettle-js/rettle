import { RettleConfigInterface } from "./config";
interface BuildScriptInterface {
    outDir: string;
}
export declare const createTsConfigFile: () => Promise<unknown>;
export declare const createCacheAppFile: (c: {
    js: RettleConfigInterface<any>["js"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
}) => Promise<unknown>;
export declare const buildScript: ({ outDir }: BuildScriptInterface, c: {
    js: RettleConfigInterface<any>["js"];
    define: RettleConfigInterface<any>["define"];
}) => Promise<unknown>;
export declare const watchScript: ({ outDir }: BuildScriptInterface, c: {
    js: RettleConfigInterface<any>["js"];
    define: RettleConfigInterface<any>["define"];
    esbuild: RettleConfigInterface<any>["esbuild"];
}) => Promise<unknown>;
export declare const translateTs2Js: (code: string) => string;
export declare const eraseExports: (code: string) => Promise<string>;
export declare const outputFormatFiles: (file: string) => Promise<unknown>;
export {};
