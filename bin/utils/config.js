"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIgnores = exports.createConfig = void 0;
const path = __importStar(require("path"));
const sortStringsBySlashCount = (strings) => {
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
const createConfig = () => {
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
        }
        else if (fs.existsSync(jsConfigPath)) {
            return require(jsConfigPath).default();
        }
        else {
            return {};
        }
    };
    const config = deepmerge(defaultConfig, inputConfig(), {
        isMergeableObject: isPlainObject,
    });
    config.endpoints = sortStringsBySlashCount(config.endpoints);
    return config;
};
exports.createConfig = createConfig;
const getIgnores = (endpoint, c) => {
    const ignores = c.endpoints.filter((x, i, self) => {
        const rootEndpoint = path.join(c.root, self[i]);
        return (self[i] !== endpoint &&
            !endpoint.includes(rootEndpoint.replace("/**/*", "")));
    });
    return ignores.map((item) => {
        return item.includes("/**/*") ? item : path.join(item, "/**/*");
    });
};
exports.getIgnores = getIgnores;
