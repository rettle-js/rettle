"use strict";
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
exports.build = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const AppScriptBuilder_1 = require("../utils/AppScriptBuilder");
const utility_1 = require("../utils/utility");
const HTMLBuilder_1 = require("../utils/HTMLBuilder");
const directoryControl_1 = require("../utils/directoryControl");
const js_beautify_1 = __importDefault(require("js-beautify"));
const clean_css_1 = __importDefault(require("clean-css"));
const config_1 = require("../utils/config");
const build = () => __awaiter(void 0, void 0, void 0, function* () {
    const config = (0, config_1.createConfig)();
    yield Promise.all([
        (0, utility_1.resetDir)(config.outDir),
        (0, utility_1.resetDir)(".cache/src"),
        (0, utility_1.resetDir)(".cache/scripts"),
        (0, utility_1.resetDir)(".cache/temporary"),
    ]);
    /* build app.js files */
    const buildSetupOptions = {
        outDir: path_1.default.join(config.outDir, config.pathPrefix),
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
    try {
        yield (0, AppScriptBuilder_1.buildScript)(buildSetupOptions, {
            js: config.js,
            define: config.define,
        });
    }
    catch (e) {
        throw e;
    }
    if (config.beautify.script) {
        const files = glob_1.default.sync(path_1.default.join(buildSetupOptions.outDir, "/**/*"), {
            nodir: true,
        });
        for (const file of files) {
            const code = fs_1.default.readFileSync(file, "utf-8");
            const beauty = js_beautify_1.default.js(code, typeof config.beautify.script === "boolean"
                ? {}
                : config.beautify.script);
            fs_1.default.writeFileSync(file, beauty);
        }
    }
    const jsFiles = glob_1.default.sync(path_1.default.join(config.outDir, config.pathPrefix, "/**/*.js"), {
        nodir: true,
    });
    for (const js of jsFiles) {
        config.build.buildScript(js);
    }
    // Create HTML FILES
    const entryPaths = (0, utility_1.getEntryPaths)(config.root, config.endpoints);
    Object.keys(entryPaths).map((key) => __awaiter(void 0, void 0, void 0, function* () {
        const items = entryPaths[key];
        let styles = ``;
        yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const pattern = /\[[^\]]*\]/;
            if (pattern.test(item)) {
                const relativePath = ("./" + item);
                if (config.dynamicRoutes) {
                    if (config.dynamicRoutes[relativePath]) {
                        const routeIsArray = Array.isArray(config.dynamicRoutes[relativePath]);
                        const routingSetting = config.dynamicRoutes[relativePath];
                        const requestData = routeIsArray
                            ? routingSetting
                            : (yield routingSetting());
                        const promises = requestData.map((id) => {
                            return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
                                const compileData = yield (0, HTMLBuilder_1.transformReact2HTMLCSSDynamic)(item, id, {
                                    define: config.define,
                                    esbuild: config.esbuild,
                                    beautify: config.beautify,
                                });
                                const { htmlOutputPath, code, style } = yield (0, HTMLBuilder_1.compileHTML)(item, compileData, {
                                    js: path_1.default.join("/", config.root, config.pathPrefix),
                                    css: path_1.default.join("/", config.root, config.pathPrefix),
                                }, compileData.helmet, {
                                    root: config.root,
                                    pathPrefix: config.pathPrefix,
                                    js: config.js,
                                    css: config.css,
                                    template: config.template,
                                    version: config.version,
                                    header: config.header,
                                    outDir: config.outDir,
                                    esbuild: config.esbuild,
                                    build: config.build,
                                }, {
                                    dynamic: id,
                                    module: false,
                                });
                                styles = styles + style;
                                fs_1.default.writeFileSync(htmlOutputPath, code, "utf-8");
                                resolve(null);
                            }));
                        });
                        yield Promise.all(promises);
                    }
                }
            }
            else {
                const compileData = yield (0, HTMLBuilder_1.transformReact2HTMLCSS)(item, {
                    esbuild: config.esbuild,
                    define: config.define,
                    beautify: config.beautify,
                });
                const { htmlOutputPath, code, style } = yield (0, HTMLBuilder_1.compileHTML)(item, compileData, {
                    js: path_1.default.join("/", config.root, config.pathPrefix),
                    css: path_1.default.join("/", config.root, config.pathPrefix),
                }, compileData.helmet, {
                    root: config.root,
                    pathPrefix: config.pathPrefix,
                    js: config.js,
                    css: config.css,
                    template: config.template,
                    version: config.version,
                    header: config.header,
                    outDir: config.outDir,
                    esbuild: config.esbuild,
                    build: config.build,
                });
                styles = styles + style;
                fs_1.default.writeFileSync(htmlOutputPath, code, "utf-8");
            }
        })));
        const root = key.replace(config.root, "");
        const cssOutputPath = path_1.default.join(config.outDir, config.pathPrefix, root, config.css);
        const formattedStyle = new clean_css_1.default({
            level: {
                2: {
                    overrideProperties: true,
                },
            },
        }).minify(styles);
        const beautyStyle = config.beautify.css
            ? typeof config.beautify.css === "boolean"
                ? js_beautify_1.default.css(formattedStyle.styles, {})
                : js_beautify_1.default.css(formattedStyle.styles, config.beautify.css)
            : formattedStyle.styles;
        const resultCss = config.build.buildCss(beautyStyle, cssOutputPath);
        yield (0, utility_1.mkdirp)(cssOutputPath);
        fs_1.default.writeFileSync(cssOutputPath, resultCss, "utf-8");
    }));
    yield (0, directoryControl_1.copyStatic)(config.static, config.outDir, config.pathPrefix);
    config.build.copyStatic();
});
exports.build = build;
