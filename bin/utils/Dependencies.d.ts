import madge from "madge";
export declare const checkScript: (filePath: string) => boolean;
export declare const getMadgeObject: (target: string, config?: madge.MadgeConfig) => Promise<madge.MadgeModuleDependencyGraph>;
export declare const getMadgeCircular: (target: string, config?: madge.MadgeConfig) => Promise<string[][]>;
export declare const getMadgeLeaves: (target: string, config?: madge.MadgeConfig) => Promise<string[]>;
export declare const getDependencies: (targetDir: string, ignore: Array<string>) => Promise<string[]>;
