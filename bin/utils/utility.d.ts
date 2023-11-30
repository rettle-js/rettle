import { RettleConfigInterface } from "./config";
export declare const watchSources: (c: {
    js: RettleConfigInterface<any>["js"];
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
}) => void;
export declare const resetDir: (dirRoot: string) => Promise<unknown>;
export declare const mkdirp: (filePath: string) => Promise<unknown>;
export declare const createHash: (str: string) => string;
export declare const getEntryPaths: (root: RettleConfigInterface<any>["root"], endpoints: RettleConfigInterface<any>["endpoints"]) => {
    [index: string]: string[];
};
export declare const getFilesName: (filepath: string) => string;
export declare const checkEndpoint: (file: string, endpoints: RettleConfigInterface<any>["endpoints"], root: RettleConfigInterface<any>["root"]) => string | undefined;
