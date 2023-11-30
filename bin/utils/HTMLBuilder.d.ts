/// <reference types="node" />
/// <reference types="node" />
import { RettleConfigInterface } from "./config";
import * as buffer from "buffer";
interface HelmetType {
    title: string;
    bodyAttributes: string;
    htmlAttributes: string;
    meta: {
        [index: string]: string;
    }[];
    script: {
        [index: string]: string;
    }[];
    link: {
        [index: string]: string;
    }[];
    noscript: {
        [index: string]: string;
        innerText: string;
    }[];
}
export declare const transformReact2HTMLCSS: (targetPath: string, c: {
    esbuild: RettleConfigInterface<any>["esbuild"];
    define: RettleConfigInterface<any>["define"];
    beautify: RettleConfigInterface<any>["beautify"];
}) => Promise<{
    html: string;
    ids: Array<string>;
    css: string;
    helmet: HelmetType;
}>;
export declare const transformReact2HTMLCSSDynamic: (path: string, id: string, c: {
    define: RettleConfigInterface<any>["define"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    beautify: RettleConfigInterface<any>["beautify"];
}) => Promise<{
    html: string;
    ids: Array<string>;
    css: string;
    helmet: HelmetType;
}>;
export declare const createHeaderTags: (tagName: string, contents: Record<string, string | number | boolean>[]) => string[];
export declare const createHeaders: (version: RettleConfigInterface<any>["version"], header: RettleConfigInterface<any>["header"]) => string[];
interface RettleHelmetType {
    headers: string[];
    attributes: {
        body: string;
        html: string;
    };
    body: string[];
}
export declare const createHelmet: (helmet: HelmetType) => RettleHelmetType;
export declare const compileHTML: (file: string, codes: {
    html: string;
    css: string;
    ids: string[];
}, assetsRoots: {
    js: string;
    css: string;
}, helmets: HelmetType, c: {
    root: RettleConfigInterface<any>["root"];
    pathPrefix: RettleConfigInterface<any>["pathPrefix"];
    js: RettleConfigInterface<any>["js"];
    css: RettleConfigInterface<any>["css"];
    template: RettleConfigInterface<any>["template"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    outDir: RettleConfigInterface<any>["outDir"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    build: RettleConfigInterface<any>["build"];
}, options?: {
    dynamic?: string;
    noDir?: boolean;
    module?: boolean;
}) => Promise<{
    code: string | buffer.Buffer;
    htmlOutputPath: string;
    style: string;
}>;
export {};
