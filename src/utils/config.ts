import { templateHTMLInterface } from "./template.html";
import * as esBuild from "esbuild";
import * as path from "path";
import js_beautify from "js-beautify";
interface RouterOptions {
  caseSensitive?: boolean | undefined;
  mergeParams?: boolean | undefined;
  strict?: boolean | undefined;
}

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

const sortStringsBySlashCount = (strings: Array<string>) => {
  const slashCountMap = new Map();

  // 各文字列の/の数をカウントする
  for (const string of strings) {
    const count = (string.match(/\//g) || []).length;
    slashCountMap.set(string, count);
  }

  // /の数でソートする
  const sorted = strings.sort((a, b) => {
    return slashCountMap.get(b) - slashCountMap.get(a);
  });

  return sorted;
};

export const createConfig = (): RettleConfigInterface => {
  const path = require("path");
  const fs = require("fs");
  const { extensions } = require("interpret");
  const deepmerge = require("deepmerge");
  const { defaultConfig } = require("./defaultConfigure");
  const { isPlainObject } = require("is-plain-object");
  const rechoir = require("rechoir");
  const tsConfigPath = path.resolve("./rettle-config.ts");
  const jsConfigPath = path.resolve("./rettle-config.js");
  const inputConfig = () => {
    if (fs.existsSync(tsConfigPath)) {
      rechoir.prepare(extensions, "./rettle-config.ts");
      const requireConfig = require(tsConfigPath).default();
      return requireConfig;
    } else if (fs.existsSync(jsConfigPath)) {
      return require(jsConfigPath).default();
    } else {
      return {};
    }
  };
  const config = deepmerge(defaultConfig, inputConfig(), {
    isMergeableObject: isPlainObject,
  });
  config.endpoints = sortStringsBySlashCount(config.endpoints);
  return config;
};

export const getIgnores = (
  endpoint: string,
  c: {
    endpoints: RettleConfigInterface<any>["endpoints"];
    root: RettleConfigInterface<any>["root"];
  }
) => {
  const ignores = c.endpoints.filter((x: string, i: number, self: string[]) => {
    const rootEndpoint = path.join(c.root, self[i]);
    return (
      self[i] !== endpoint &&
      !endpoint.includes(rootEndpoint.replace("/**/*", ""))
    );
  }) as string[];
  return ignores.map((item) => {
    return item.includes("/**/*") ? item : path.join(item, "/**/*");
  });
};
