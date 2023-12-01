import { RettleConfigInterface } from "./config";
import { Plugin } from "vite";
export declare const viteAdditionalStaticPlugin: (c: {
    server: RettleConfigInterface<any>["server"];
}) => Plugin;
