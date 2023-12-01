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
const utility_1 = require("../utils/utility");
const path = __importStar(require("node:path"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const HTMLBuilder_1 = require("../utils/HTMLBuilder");
const defaultConfigure_1 = require("../utils/defaultConfigure");
const fs = __importStar(require("node:fs"));
const glob_1 = __importDefault(require("glob"));
const AppScriptBuilder_1 = require("../utils/AppScriptBuilder");
const viteRettlePluginBuild = (option) => {
    let userConfig;
    const resourceMap = {};
    const fileMap = {};
    return {
        name: "vite-plugin-rettle",
        apply: "build",
        buildStart: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    (0, utility_1.resetDir)(path.resolve("./.cache/src")),
                    (0, utility_1.resetDir)(path.resolve("./.cache/scripts")),
                    (0, utility_1.resetDir)(path.resolve("./.cache/temporary")),
                    (0, utility_1.resetDir)(path.resolve("./.cache/style")),
                ]);
                const srcFiles = glob_1.default.sync(`./src/**/*{ts,js,tsx,jsx,json}`, {
                    nodir: true,
                });
                yield Promise.all(srcFiles.map((file) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        yield (0, AppScriptBuilder_1.outputFormatFiles)(file);
                        resolve(null);
                    }
                    catch (e) {
                        reject(e);
                    }
                }))));
                try {
                    yield (0, AppScriptBuilder_1.createTsConfigFile)();
                }
                catch (e) {
                    throw e;
                }
                try {
                    yield (0, AppScriptBuilder_1.createCacheAppFile)({
                        js: defaultConfigure_1.defaultConfig.js,
                        endpoints: defaultConfigure_1.defaultConfig.endpoints,
                        root: path.join(userConfig.root || "/", option.routes),
                    });
                }
                catch (e) {
                    throw e;
                }
            }
            catch (e) {
                console.log("Error", e);
            }
        }),
        config: (config) => {
            userConfig = config;
        },
        options: (InputOption) => {
            const root = path.join("./", userConfig.root || "/", option.routes);
            const entryPaths = (0, utility_1.getEntryPaths)(root, ["/"]);
            const overrideInput = {
                input: {},
            };
            Object.keys(entryPaths).map((key) => {
                const items = entryPaths[key];
                items.map((item) => {
                    item = path.resolve("./", item);
                    const filename = path.basename(item);
                    const relativePath = path
                        .join(path.relative(root, item))
                        .replace(`${filename}`, "")
                        .slice(0, -1) || "main";
                    const dummyPath = path.resolve(path.join(item.replace(option.routes, "")));
                    fileMap[dummyPath] = {
                        file: "",
                        key: "",
                        relativePath: "",
                    };
                    fileMap[dummyPath].file = item;
                    fileMap[dummyPath].key = key;
                    fileMap[dummyPath].relativePath = relativePath;
                    overrideInput.input[relativePath] = dummyPath;
                });
            });
            return (0, deepmerge_1.default)(InputOption, overrideInput);
        },
        resolveId: (id) => {
            if (id.endsWith(".tsx")) {
                const filePath = fileMap[id];
                const dummy = id.replace(".tsx", ".html");
                resourceMap[dummy] = {
                    path: "",
                    key: "",
                    relativePath: "",
                };
                resourceMap[dummy].path = path.resolve(filePath.file);
                resourceMap[dummy].key = filePath.key;
                resourceMap[dummy].relativePath = filePath.relativePath;
                return dummy;
            }
        },
        load: (id) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (id in resourceMap) {
                try {
                    const item = resourceMap[id];
                    const compileData = yield (0, HTMLBuilder_1.transformReact2HTMLCSS)(item.path, {
                        esbuild: defaultConfigure_1.defaultConfig.esbuild,
                        define: userConfig.define,
                        beautify: defaultConfigure_1.defaultConfig.beautify,
                    });
                    const jsResolvePath = path.dirname(path.resolve(path.join("./.cache/scripts", defaultConfigure_1.defaultConfig.js)));
                    const jsPath = {
                        root: jsResolvePath.replace(path.resolve("./"), ""),
                        name: "app.js",
                    };
                    const cssResolvePath = path.resolve(path.join("./.cache/style", item.relativePath));
                    const cssPath = {
                        root: cssResolvePath.replace(path.resolve("./"), ""),
                        name: "app.css",
                    };
                    const { htmlOutputPath, code, style } = yield (0, HTMLBuilder_1.compileHTML)(item.path, compileData, {
                        js: `/${jsPath.root}`,
                        css: `/${cssPath.root}`,
                    }, compileData.helmet, {
                        root: option.routes,
                        pathPrefix: userConfig.base || "/",
                        js: jsPath.name,
                        css: cssPath.name,
                        template: option.template,
                        version: option.version,
                        header: {},
                        outDir: ((_a = userConfig.build) === null || _a === void 0 ? void 0 : _a.outDir) || "dist",
                        esbuild: defaultConfigure_1.defaultConfig.esbuild,
                        build: option.buildHook,
                    }, {
                        noDir: true,
                        module: true,
                    });
                    const stylePath = path.join(cssResolvePath, cssPath.name);
                    fs.mkdirSync(cssResolvePath, {
                        recursive: true,
                    });
                    fs.writeFileSync(stylePath, style, "utf8");
                    if (typeof code === "string") {
                        return code;
                    }
                    else {
                        return code.toString();
                    }
                }
                catch (e) {
                    console.log("Error: ", e);
                }
            }
        }),
    };
};
exports.default = viteRettlePluginBuild;
