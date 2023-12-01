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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const utility_1 = require("../utils/utility");
const defaultConfigure_1 = require("../utils/defaultConfigure");
const path = __importStar(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const viteCompileTsxFile_1 = require("../utils/viteCompileTsxFile");
const viteRettlePluginServer = (option) => {
    let userConfig;
    return {
        name: "vite-plugin-rettle",
        apply: "serve",
        handleHotUpdate(context) {
            if (!context.file.includes(".cache") && option.hotReload) {
                context.server.ws.send({
                    type: "full-reload",
                });
                return [];
            }
        },
        config: (config) => __awaiter(void 0, void 0, void 0, function* () {
            userConfig = config;
            (0, utility_1.watchSources)({
                js: defaultConfigure_1.defaultConfig.js,
                endpoints: defaultConfigure_1.defaultConfig.endpoints,
                root: path.join(userConfig.root || "/", option.routes),
            });
        }),
        configureServer: (server) => {
            server.middlewares.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const request = path.join(server.config.root, option.routes, req.url || "");
                const extName = path.extname(request);
                let fullReqPath = path.join(request, extName ? "" : "index.html");
                if (fullReqPath.endsWith(".html")) {
                    const tsxPath = path.join(...`${fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) ||
                        fullReqPath}.tsx`.split(userConfig.base || ""));
                    if (!node_fs_1.default.existsSync(tsxPath)) {
                        return next();
                    }
                    const html = yield (0, viteCompileTsxFile_1.compileTsx)(tsxPath, {
                        js: defaultConfigure_1.defaultConfig.js,
                        template: defaultConfigure_1.defaultConfig.template,
                        version: option.version,
                        header: defaultConfigure_1.defaultConfig.header,
                        esbuild: defaultConfigure_1.defaultConfig.esbuild,
                        define: userConfig.define,
                        beautify: defaultConfigure_1.defaultConfig.beautify,
                        endpoints: defaultConfigure_1.defaultConfig.endpoints,
                        root: path.join(path.join(userConfig.root || ""), option.routes),
                    });
                    const result = yield server.transformIndexHtml(fullReqPath, html, userConfig.base);
                    return (0, vite_1.send)(req, res, result, "html", {});
                }
                next();
            }));
        },
    };
};
exports.default = viteRettlePluginServer;
