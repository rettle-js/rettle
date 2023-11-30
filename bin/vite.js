"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./vitePlugins/server"));
const build_1 = __importDefault(require("./vitePlugins/build"));
const defaultConfigure_1 = require("./utils/defaultConfigure");
const deepmerge_1 = __importDefault(require("deepmerge"));
const defaultOptions = {
    beautify: defaultConfigure_1.defaultConfig.beautify,
    dynamicRoutes: undefined,
    template: defaultConfigure_1.defaultConfig.template,
    version: defaultConfigure_1.defaultConfig.version,
    routes: "views",
    buildHook: defaultConfigure_1.defaultConfig.build,
};
exports.default = (options = {}) => {
    const option = (0, deepmerge_1.default)(defaultOptions, options);
    return [(0, build_1.default)(option), (0, server_1.default)(option)];
};
