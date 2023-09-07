export declare const mkdirp: (filePath: string) => Promise<unknown>;
export declare const createHash: (str: string) => string;
export declare const getEntryPaths: () => {
    [index: string]: string[];
};
export declare const getFilesName: (filepath: string) => string;
export declare const checkEndpoint: (file: string) => string | undefined;
