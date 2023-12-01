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
exports.getWaitingPath = exports.checkDynamicRoute = exports.viteDynamicRouting = void 0;
const node_path_1 = __importDefault(require("node:path"));
const viteCompileTsxFile_1 = require("./viteCompileTsxFile");
const fs = __importStar(require("node:fs"));
const getWaitingPath = (c) => __awaiter(void 0, void 0, void 0, function* () {
    const waitingData = [];
    const pattern = /\[(.*?)\]/;
    if (c.dynamicRoutes) {
        for (const relativePath of Object.keys(c.dynamicRoutes)) {
            const routeIsArray = Array.isArray(c.dynamicRoutes[relativePath]);
            const routingSetting = c.dynamicRoutes[relativePath];
            const requestData = routeIsArray
                ? routingSetting
                : (yield routingSetting());
            for (const key of requestData) {
                const id = `[${relativePath.match(pattern)[1]}]`;
                const exName = node_path_1.default.extname(relativePath);
                const resolvePath = node_path_1.default.resolve(relativePath.replace(id, key).replace(exName, ".html"));
                waitingData.push({
                    wait: resolvePath,
                    src: relativePath,
                    id: key,
                });
            }
        }
    }
    return waitingData;
});
exports.getWaitingPath = getWaitingPath;
const checkDynamicRoute = (requestHTML, config) => {
    for (const conf of config) {
        if (requestHTML === conf.wait) {
            return conf;
        }
    }
    return false;
};
exports.checkDynamicRoute = checkDynamicRoute;
const viteDynamicRouting = (tsxPath, id, c) => __awaiter(void 0, void 0, void 0, function* () {
    if (fs.existsSync(tsxPath)) {
        try {
            const result = yield (0, viteCompileTsxFile_1.compileDynamicTsx)(tsxPath, id, c);
            return yield Promise.resolve(result);
        }
        catch (e) {
            return yield Promise.reject(e);
        }
    }
    else {
        return yield Promise.reject();
    }
});
exports.viteDynamicRouting = viteDynamicRouting;
