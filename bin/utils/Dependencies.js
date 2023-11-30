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
exports.getDependencies = exports.getMadgeLeaves = exports.getMadgeCircular = exports.getMadgeObject = exports.checkScript = void 0;
const glob_1 = __importDefault(require("glob"));
const madge_1 = __importDefault(require("madge"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const checkScript = (filePath) => {
    return fs_1.default.readFileSync(filePath, "utf-8").includes("export const client");
};
exports.checkScript = checkScript;
const getMadgeObject = (target, config) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, madge_1.default)(target, config);
    return res.obj();
});
exports.getMadgeObject = getMadgeObject;
const getMadgeCircular = (target, config) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, madge_1.default)(target, config);
    return res.circular();
});
exports.getMadgeCircular = getMadgeCircular;
const getMadgeLeaves = (target, config) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, madge_1.default)(target, config);
    return res.leaves();
});
exports.getMadgeLeaves = getMadgeLeaves;
const getDependencies = (targetDir, ignore) => __awaiter(void 0, void 0, void 0, function* () {
    const targets = glob_1.default.sync(path.join(targetDir, "/**/*"), {
        ignore: ["node_modules/**/*", ...ignore],
        nodir: true,
    });
    const dependenciesFiles = [];
    const madgePromises = [];
    for (const target of targets) {
        const promiseFunction = new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            const obj = yield (0, exports.getMadgeObject)(target, {
                baseDir: "./",
                tsConfig: path.resolve("./tsconfig.json"),
            });
            Object.keys(obj).forEach((key) => {
                if ((0, exports.checkScript)(key)) {
                    dependenciesFiles.push(key);
                }
                for (const targetFilePath of obj[key]) {
                    if ((0, exports.checkScript)(targetFilePath)) {
                        dependenciesFiles.push(targetFilePath);
                    }
                }
                resolve(null);
            });
        }));
        madgePromises.push(promiseFunction);
    }
    yield Promise.all(madgePromises);
    return dependenciesFiles.filter((x, i, self) => {
        return self.indexOf(x) === i;
    });
});
exports.getDependencies = getDependencies;
