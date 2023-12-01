import { RettleConfigInterface } from "./config";
export declare const copyStatic: (staticDir: RettleConfigInterface<any>["static"], outDir: RettleConfigInterface<any>["outDir"], pathPrefix: RettleConfigInterface<any>["pathPrefix"]) => Promise<void>;
export declare const deleteDir: (root: string) => void;
