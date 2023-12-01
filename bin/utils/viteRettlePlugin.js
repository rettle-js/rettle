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
exports.viteRettlePlugin = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const vite_1 = require("vite");
const errorTemplate_html_1 = __importStar(require("./errorTemplate.html"));
const viteCompileTsxFile_1 = require("./viteCompileTsxFile");
const viteDynamicRouting_1 = require("./viteDynamicRouting");
const errorResult = (e) => {
    const errorType = String(e);
    const stack = e.stack
        .split("<br/>")
        .map((item, i) => (i !== 0 ? item + "<br/>" : ""))
        .join("");
    return (0, errorTemplate_html_1.default)("Build Error", (0, errorTemplate_html_1.errorTemplate)(`<p class="color-red">${errorType}</p><p class="pl-20">${stack}</p>`));
};
let dynamicPaths;
const viteRettlePlugin = (c) => ({
    name: "vite-plugin-rettle",
    apply: "serve",
    configureServer(server) {
        return __awaiter(this, void 0, void 0, function* () {
            dynamicPaths = yield (0, viteDynamicRouting_1.getWaitingPath)({
                dynamicRoutes: c.dynamicRoutes,
            });
            server.middlewares.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const root = server.config.root;
                let fullReqPath = path_1.default.join(root, c.root, req.url || "");
                let fullReqStaticPath = path_1.default.join(root, c.static, req.url || "");
                if (fullReqPath.endsWith("/")) {
                    fullReqPath += "index.html";
                }
                if (fullReqStaticPath.endsWith("/")) {
                    fullReqStaticPath += "index.html";
                }
                const fullReqPathWithoutPrefix = path_1.default.join(...fullReqPath.split(c.pathPrefix));
                if (fullReqPath.endsWith(".html")) {
                    const tsxPath = `${fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) ||
                        fullReqPath}.tsx`.replace(path_1.default.join(c.root, c.pathPrefix), c.root);
                    if (fs_1.default.existsSync(tsxPath)) {
                        try {
                            const result = yield (0, viteCompileTsxFile_1.compileTsx)(tsxPath, {
                                js: c.js,
                                template: c.template,
                                version: c.version,
                                header: c.header,
                                esbuild: c.esbuild,
                                define: c.define,
                                beautify: c.beautify,
                                endpoints: c.endpoints,
                                root: c.root,
                            });
                            return (0, vite_1.send)(req, res, result, "html", {});
                        }
                        catch (e) {
                            const result = errorResult(e);
                            return (0, vite_1.send)(req, res, result, "html", {});
                        }
                    }
                    else if ((0, viteDynamicRouting_1.checkDynamicRoute)(fullReqPathWithoutPrefix, dynamicPaths)) {
                        const dynamicPath = (0, viteDynamicRouting_1.checkDynamicRoute)(fullReqPathWithoutPrefix, dynamicPaths);
                        // Dynamic Routing
                        try {
                            const result = yield (0, viteDynamicRouting_1.viteDynamicRouting)(dynamicPath.src, dynamicPath.id, {
                                define: c.define,
                                esbuild: c.esbuild,
                                beautify: c.beautify,
                                version: c.version,
                                header: c.header,
                                endpoints: c.endpoints,
                                root: c.root,
                                js: c.js,
                                template: c.template,
                            });
                            return (0, vite_1.send)(req, res, result, "html", {});
                        }
                        catch (e) {
                            const result = errorResult(e);
                            return (0, vite_1.send)(req, res, result, "html", {});
                        }
                    }
                    else if (fs_1.default.existsSync(fullReqStaticPath)) {
                        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.endsWith("/")) {
                            req.url = req.url + "index.html";
                        }
                        return next();
                    }
                    else {
                        const html = `<div><h1 class="title text-center">404 Page Not Found</h1></div>`;
                        return (0, vite_1.send)(req, res, (0, errorTemplate_html_1.default)("", html), "html", {});
                    }
                }
                else {
                    return next();
                }
            }));
        });
    },
});
exports.viteRettlePlugin = viteRettlePlugin;
