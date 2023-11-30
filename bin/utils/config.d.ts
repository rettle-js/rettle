/// <reference types="node" />
import { templateHTMLInterface } from "./template.html";
import * as esBuild from "esbuild";
import js_beautify from "js-beautify";
type DynamicRouteArray = string[];
type DynamicRouteFunction = () => Promise<DynamicRouteArray>;
export type DynamicRoute = {
    [path: `./${string}`]: string[] | DynamicRouteFunction;
};
export interface BuildOptionsInterface {
    copyStatic?: () => void;
    buildScript?: (outDir: string) => void;
    buildCss?: (code: string, outDir: string) => string | Buffer;
    buildHTML?: (code: string, outDir: string) => string | Buffer;
}
interface esbuildInterface {
    plugins?: (mode: "server" | "client") => esBuild.Plugin[];
}
export interface BeautifyOptions {
    css?: js_beautify.CSSBeautifyOptions | boolean;
    html?: js_beautify.HTMLBeautifyOptions | boolean;
    script?: js_beautify.JSBeautifyOptions | boolean;
}
export interface RettleConfigInterface<T extends Record<string, string> = {}> {
    pathPrefix: string;
    css: string;
    js: string;
    root: string;
    beautify: BeautifyOptions;
    endpoints: Array<string>;
    static: string;
    outDir: string;
    define?: T;
    header?: {
        meta?: Record<string, string | number | boolean>[];
        link?: Record<string, string | number | boolean>[];
        script?: Record<string, string | number | boolean>[];
    };
    dynamicRoutes?: DynamicRoute;
    template: (options: templateHTMLInterface) => string;
    build: BuildOptionsInterface;
    esbuild: esbuildInterface;
    version: boolean;
    server: {
        port?: number;
        host?: string;
        listenDir?: string[];
    };
}
export declare const createConfig: () => RettleConfigInterface;
export declare const getIgnores: (endpoint: string, c: {
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
}) => string[];
export {};
