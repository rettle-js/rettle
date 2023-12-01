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
exports.server = void 0;
const AppScriptBuilder_1 = require("../utils/AppScriptBuilder");
const viteServer_1 = require("../utils/viteServer");
const config_1 = require("../utils/config");
const path = __importStar(require("path"));
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const directoryControl_1 = require("../utils/directoryControl");
const utility_1 = require("../utils/utility");
const resetDir = (dirRoot) => {
    return new Promise((resolve) => {
        if (fs_1.default.existsSync(dirRoot)) {
            (0, directoryControl_1.deleteDir)(dirRoot);
        }
        resolve(null);
    });
};
const server = () => __awaiter(void 0, void 0, void 0, function* () {
    const config = (0, config_1.createConfig)();
    yield Promise.all([
        resetDir(".cache/src"),
        resetDir(".cache/scripts"),
        resetDir(".cache/temporary"),
    ]);
    /* build app.js files */
    const buildSetupOptions = {
        outDir: path.join(".cache/temporary", config.pathPrefix),
    };
    const srcFiles = glob_1.default.sync("./src/**/*{ts,js,tsx,jsx,json}", {
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
            js: config.js,
            endpoints: config.endpoints,
            root: config.root,
        });
    }
    catch (e) {
        throw e;
    }
    (0, utility_1.watchSources)({
        js: config.js,
        endpoints: config.endpoints,
        root: config.root,
    });
    /* wake up html and css server */
    (0, viteServer_1.wakeupViteServer)({
        server: config.server,
        static: config.static,
        pathPrefix: config.pathPrefix,
        define: config.define,
        root: config.root,
        dynamicRoutes: config.dynamicRoutes,
        js: config.js,
        template: config.template,
        version: config.version,
        header: config.header,
        esbuild: config.esbuild,
        beautify: config.beautify,
        endpoints: config.endpoints,
    }).then();
});
exports.server = server;
