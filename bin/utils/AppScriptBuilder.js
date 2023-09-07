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
exports.outputFormatFiles = exports.eraseExports = exports.translateTs2Js = exports.watchScript = exports.buildScript = exports.createCacheAppFile = exports.createTsConfigFile = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const template_tsconfig_json_1 = __importDefault(require("./template-tsconfig.json"));
const Dependencies_1 = require("./Dependencies");
const config_1 = require("./config");
const glob_1 = __importDefault(require("glob"));
const utility_1 = require("./utility");
const acorn = __importStar(require("acorn"));
const acorn_jsx_1 = __importDefault(require("acorn-jsx"));
const typescript_1 = __importDefault(require("typescript"));
const utility_2 = require("./utility");
const deepmerge_1 = __importDefault(require("deepmerge"));
const is_plain_object_1 = require("is-plain-object");
const tsc_alias_1 = require("tsc-alias");
const createTsConfigFile = () => {
    return new Promise((resolve) => {
        if (!fs_1.default.existsSync(path_1.default.resolve(".cache"))) {
            fs_1.default.mkdirSync(path_1.default.resolve(".cache"));
        }
        fs_1.default.writeFileSync(path_1.default.resolve("./.cache/tsconfig.json"), JSON.stringify(template_tsconfig_json_1.default, null, 2), "utf-8");
        resolve(null);
    });
};
exports.createTsConfigFile = createTsConfigFile;
const createFileName = (filePath) => {
    const relativePath = path_1.default
        .relative(path_1.default.resolve(config_1.config.root), filePath)
        .replace("/**/*", "")
        .replace("**/*", "");
    return relativePath;
};
const createComponentDep = (filepath) => __awaiter(void 0, void 0, void 0, function* () {
    let results = {};
    const tempObj = yield (0, Dependencies_1.getMadgeObject)(filepath, {
        baseDir: "./",
        tsConfig: path_1.default.resolve("./tsconfig.json"),
    });
    let obj = tempObj[filepath];
    for (const dep of obj) {
        if ((0, Dependencies_1.checkScript)(dep)) {
            const temp = yield createComponentDep(dep);
            results = (0, deepmerge_1.default)(results, {
                [(0, utility_2.getFilesName)(dep)]: `createComponent("${(0, utility_2.createHash)(path_1.default.resolve(dep))}", Script_${createScriptHash(dep)}("${(0, utility_2.createHash)(path_1.default.resolve(dep))}", {${temp}})),`,
            }, { isMergeableObject: is_plain_object_1.isPlainObject });
        }
        else {
            const temp = yield createComponentDep(dep);
            results = (0, deepmerge_1.default)(results, {
                [(0, utility_2.getFilesName)(dep)]: `{${temp}},`,
            }, { isMergeableObject: is_plain_object_1.isPlainObject });
        }
    }
    return Object.keys(results)
        .map((item) => {
        return `${item}: ${results[item]}`;
    })
        .join("\n");
});
const createScriptHash = (str) => {
    return crypto_1.default.createHash("md5").update(str).digest("hex");
};
const createCacheAppFile = () => {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const jsFileName = path_1.default.basename(config_1.config.js).replace(".js", "");
        const jsBaseDir = path_1.default.dirname(config_1.config.js);
        for (const endpoint of config_1.config.endpoints) {
            const rootEndpoint = path_1.default.join(config_1.config.root, endpoint);
            const ignore = (0, config_1.getIgnores)(rootEndpoint);
            const files = yield (0, Dependencies_1.getDependencies)(rootEndpoint, ignore);
            const appResolvePath = createFileName(rootEndpoint);
            const appFilePath = path_1.default.join(".cache/scripts", appResolvePath, jsBaseDir, `${jsFileName}.js`);
            const appImports = [`import {RettleStart} from "rettle/core";`];
            const scriptObject = [];
            const scriptRunner = [`RettleStart(clients, {})`];
            const defs = [];
            for (const file of files) {
                const hash = (0, utility_2.createHash)(path_1.default.resolve(file));
                const hashName = createScriptHash(file);
                appImports.push(`import {client as Client_${hashName}} from "${path_1.default
                    .relative(path_1.default.resolve(path_1.default.join(".cache/scripts", appResolvePath, jsBaseDir)), file.replace("src/", ".cache/src/"))
                    .replace(".tsx", "")
                    .replace(".jsx", "")}";`);
                scriptObject.push(`"${hash}": Client_${hashName}`);
            }
            yield (0, utility_1.mkdirp)(appFilePath);
            const code = [
                appImports.join("\n"),
                `const clients = {${scriptObject.join(",\n")}};`,
                scriptRunner.join("\n"),
            ];
            fs_1.default.writeFileSync(appFilePath, code.join("\n"), "utf-8");
        }
        resolve(null);
    }));
};
exports.createCacheAppFile = createCacheAppFile;
const buildScript = ({ outDir }) => {
    return new Promise((resolve) => {
        const files = glob_1.default.sync(path_1.default.resolve("./.cache/scripts/**/*.js"), {
            nodir: true,
        });
        esbuild_1.default
            .build({
            bundle: true,
            // all cache scripts
            entryPoints: files,
            // If only one file is used, the directory structure is not reproduced, so separate the files.
            outdir: files.length <= 1
                ? path_1.default.join(outDir, path_1.default.dirname(config_1.config.js))
                : outDir,
            sourcemap: process.env.NODE_ENV !== "production",
            platform: "browser",
            target: "es6",
            tsconfig: ".cache/tsconfig.json",
            define: {
                "process.env": JSON.stringify(config_1.config.define),
            },
            minify: true,
        })
            .then(() => {
            resolve(null);
        });
    });
};
exports.buildScript = buildScript;
const watchScript = ({ outDir }) => {
    return new Promise((resolve) => {
        const files = glob_1.default.sync(path_1.default.resolve("./.cache/scripts/**/*.js"), {
            nodir: true,
        });
        esbuild_1.default
            .build({
            bundle: true,
            watch: {
                onRebuild(error, result) {
                    if (error)
                        console.error("watch build failed:", error);
                },
            },
            entryPoints: files,
            outdir: files.length <= 1
                ? path_1.default.join(outDir, path_1.default.dirname(config_1.config.js))
                : outDir,
            sourcemap: process.env.NODE_ENV !== "production",
            platform: "browser",
            target: "es6",
            tsconfig: ".cache/tsconfig.json",
            define: {
                "process.env": JSON.stringify(config_1.config.define),
            },
            plugins: config_1.config.esbuild.plugins("client"),
        })
            .then(() => {
            resolve(null);
        });
    });
};
exports.watchScript = watchScript;
const translateTs2Js = (code) => {
    return typescript_1.default.transpileModule(code, {
        compilerOptions: {
            target: 99,
            jsx: 2,
        },
    }).outputText;
};
exports.translateTs2Js = translateTs2Js;
const eraseExports = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsCode = (0, exports.translateTs2Js)(code);
        //@ts-ignore
        const ast = acorn.Parser.extend((0, acorn_jsx_1.default)()).parse(jsCode, {
            ecmaVersion: 2019,
            sourceType: "module",
        });
        // @ts-ignore
        const importNodes = ast.body.filter((item) => item.type === "ImportDeclaration" &&
            (item.source.value === "react" || item.source.raw === "react"));
        //@ts-ignore
        const functionNodes = ast.body.filter((item) => item.type === "FunctionDeclaration" ||
            item.type === "VariableDeclaration");
        //@ts-ignore
        const defaultExportNodes = ast.body.filter((item) => item.type === "ExportDefaultDeclaration");
        const objects = {};
        if (!defaultExportNodes)
            throw new Error("Cannot Found export");
        if (!defaultExportNodes[0])
            throw new Error("Cannot Found export");
        if ("declaration" in defaultExportNodes[0] === false)
            throw new Error("Cannot Found export");
        if (defaultExportNodes[0].declaration.name) {
            // export default **
            for (const node of functionNodes) {
                const { start, end } = node;
                const text = jsCode.slice(start, end);
                if (node.type === "FunctionDeclaration") {
                    const key = node.id.name;
                    objects[key] = text;
                }
                else if (node.type === "VariableDeclaration") {
                    const key = node.declarations[0].id.name;
                    objects[key] = text;
                }
            }
            const exportName = defaultExportNodes[0].declaration.name;
            const exportLine = jsCode.slice(defaultExportNodes[0].start, defaultExportNodes[0].end);
            const result = jsCode
                .replace(objects[exportName], "")
                .replace(exportLine, "export default () => {}");
            return (0, exports.translateTs2Js)(result);
        }
        else {
            // export default ()=>
            let replaceDefaultRettle = "";
            let names = [];
            let cacheName = "";
            if (defaultExportNodes[0]) {
                if (defaultExportNodes[0].declaration) {
                    if (defaultExportNodes[0].declaration.arguments) {
                        for (const argument of defaultExportNodes[0].declaration
                            .arguments) {
                            if (argument) {
                                if (argument.name) {
                                    names.push(argument.name);
                                }
                                if (argument.callee) {
                                    if (argument.callee.name) {
                                        names.push(argument.callee.name);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (names.length > 0) {
                for (const node of functionNodes) {
                    const { start, end } = node;
                    const text = jsCode.slice(start, end);
                    if (node.declarations[0].init.callee) {
                        let cache = node.declarations[0].init.callee.property
                            ? node.declarations[0].init.callee.property.name
                            : node.declarations[0].init.callee.name;
                        if (cache === "createCache") {
                            cacheName = node.declarations[0].id.name;
                        }
                    }
                    if (node.type === "FunctionDeclaration") {
                        const key = node.id.name;
                        objects[key] = text;
                    }
                    else if (node.type === "VariableDeclaration") {
                        const key = node.declarations[0].id.name;
                        objects[key] = text;
                    }
                }
                replaceDefaultRettle = jsCode;
                for (const name of names) {
                    if (objects[name]) {
                        replaceDefaultRettle = replaceDefaultRettle.replace(objects[name], "");
                    }
                }
                replaceDefaultRettle = replaceDefaultRettle.replace(objects[cacheName], "");
            }
            else {
                replaceDefaultRettle = jsCode;
            }
            const exportName = defaultExportNodes[0];
            const { start, end } = exportName;
            const exportStr = jsCode.slice(start, end);
            const result = replaceDefaultRettle.replace(exportStr, "") +
                "\nexport default () => {};";
            return (0, exports.translateTs2Js)(result);
        }
        return "";
    }
    catch (e) {
        throw e;
    }
});
exports.eraseExports = eraseExports;
function treatFile(filePath, code, runFile) {
    const newContents = runFile({ fileContents: code, filePath });
    fs_1.default.writeFileSync(filePath, newContents);
}
const outputFormatFiles = (file) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const replacer = yield (0, tsc_alias_1.prepareSingleFileReplaceTscAliasPaths)({
            outDir: "./.cache/src",
        });
        try {
            const filePath = path_1.default.isAbsolute(file) ? path_1.default.relative("./", file) : file;
            const outPath = path_1.default.join(".cache/", filePath).replace(/\.ts(x)?/, ".js");
            const sourceCode = fs_1.default.readFileSync(filePath, "utf-8");
            yield (0, utility_1.mkdirp)(outPath);
            if (path_1.default.extname(filePath).includes("tsx")) {
                const code = yield (0, exports.eraseExports)(sourceCode);
                fs_1.default.writeFileSync(outPath, "", "utf-8");
                treatFile(outPath, code, replacer);
            }
            else {
                const code = (0, exports.translateTs2Js)(sourceCode);
                fs_1.default.writeFileSync(outPath, "", "utf-8");
                treatFile(outPath, code, replacer);
            }
            resolve(null);
        }
        catch (e) {
            reject(e);
        }
    }));
};
exports.outputFormatFiles = outputFormatFiles;
//# sourceMappingURL=AppScriptBuilder.js.map