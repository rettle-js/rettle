interface BuildScriptInterface {
    outDir: string;
}
export declare const createTsConfigFile: () => Promise<unknown>;
export declare const createCacheAppFile: () => Promise<unknown>;
export declare const buildScript: ({ outDir }: BuildScriptInterface) => Promise<unknown>;
export declare const watchScript: ({ outDir }: BuildScriptInterface) => Promise<unknown>;
export declare const translateTs2Js: (code: string) => string;
export declare const eraseExports: (code: string) => Promise<string>;
export declare const outputFormatFiles: (file: string) => Promise<unknown>;
export {};
