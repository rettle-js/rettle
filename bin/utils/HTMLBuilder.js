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
exports.compileHTML = exports.createHelmet = exports.createHeaders = exports.createHeaderTags = exports.transformReact2HTMLCSSDynamic = exports.transformReact2HTMLCSS = void 0;
const esBuild = __importStar(require("esbuild"));
const vm_1 = __importDefault(require("vm"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const variable_1 = require("./variable");
const react_helmet_1 = __importDefault(require("react-helmet"));
const node_html_parser_1 = require("node-html-parser");
const js_beautify_1 = __importDefault(require("js-beautify"));
const utility_1 = require("./utility");
const html_minifier_terser_1 = require("html-minifier-terser");
const buffer = __importStar(require("buffer"));
const { dependencies } = JSON.parse(fs_1.default.readFileSync(path.resolve("./package.json"), "utf-8"));
const insertCommentOut = (code) => {
    const root = (0, node_html_parser_1.parse)(code);
    let HTML = root.toString();
    const articles = root.querySelectorAll("[data-comment-out]");
    for (const article of articles) {
        const beforeHTML = article.toString();
        const beginComment = article.getAttribute("comment-out-begin");
        const endComment = article.getAttribute("comment-out-end");
        const commentOutBegin = beginComment !== "none" ? `<!--- ${beginComment} --->` : "";
        const commentOutEnd = endComment !== "none" ? `<!--- ${endComment} --->` : "";
        let children = "";
        for (const child of article.childNodes) {
            children += child.toString();
        }
        const htmlArr = [];
        if (commentOutBegin !== "")
            htmlArr.push(commentOutBegin);
        if (article.childNodes.length !== 0)
            htmlArr.push(`<!--- ${config_1.config.beautify.html
                ? js_beautify_1.default.html(children, typeof config_1.config.beautify.html === "boolean"
                    ? {}
                    : config_1.config.beautify.html)
                : children} --->`);
        if (commentOutEnd !== "")
            htmlArr.push(commentOutEnd);
        HTML = HTML.replace(beforeHTML, htmlArr.join("\n"));
    }
    return HTML;
};
const transformReact2HTMLCSS = (path) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        esBuild
            .build({
            bundle: true,
            entryPoints: [path],
            platform: "node",
            write: false,
            external: Object.keys(dependencies),
            plugins: config_1.config.esbuild.plugins("server"),
            define: {
                "process.env": JSON.stringify(config_1.config.define),
            },
        })
            .then((res) => {
            try {
                const code = res.outputFiles[0].text;
                const context = {
                    exports,
                    module,
                    process,
                    require,
                    __filename,
                    __dirname,
                    Buffer: buffer.Buffer,
                };
                vm_1.default.runInNewContext(code, context);
                const result = context.module.exports.default;
                const HTML = insertCommentOut(result.html);
                if (process.env.NODE_ENV !== "server" && config_1.config.beautify.html) {
                    result.html =
                        typeof config_1.config.beautify.html === "boolean"
                            ? js_beautify_1.default.html(HTML, {})
                            : js_beautify_1.default.html(HTML, config_1.config.beautify.html);
                }
                else {
                    result.html = HTML;
                }
                if ("html" in result && "css" in result && "ids" in result) {
                    resolve(result);
                }
                else {
                    reject(new Error(`${path}: The value of export default is different.`));
                }
            }
            catch (e) {
                reject(e);
            }
        })
            .catch((e) => {
            reject(e);
        });
    }));
};
exports.transformReact2HTMLCSS = transformReact2HTMLCSS;
const transformReact2HTMLCSSDynamic = (path, id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        esBuild
            .build({
            bundle: true,
            entryPoints: [path],
            platform: "node",
            write: false,
            external: Object.keys(dependencies),
            plugins: config_1.config.esbuild.plugins("server"),
            define: {
                "process.env": JSON.stringify(config_1.config.define),
            },
        })
            .then((res) => {
            try {
                const code = res.outputFiles[0].text;
                const context = {
                    exports,
                    module,
                    process,
                    require,
                    __filename,
                    __dirname,
                    Buffer: buffer.Buffer,
                };
                vm_1.default.runInNewContext(code, context);
                const dynamicRouteFunction = context.module.exports.default;
                const result = dynamicRouteFunction(id);
                const HTML = insertCommentOut(result.html);
                if (process.env.NODE_ENV !== "server" && config_1.config.beautify.html) {
                    result.html =
                        typeof config_1.config.beautify.html === "boolean"
                            ? js_beautify_1.default.html(HTML, {})
                            : js_beautify_1.default.html(HTML, config_1.config.beautify.html);
                }
                else {
                    result.html = HTML;
                }
                if ("html" in result && "css" in result && "ids" in result) {
                    resolve(result);
                }
                else {
                    reject(new Error(`${path}: The value of export default is different.`));
                }
            }
            catch (e) {
                reject(e);
            }
        })
            .catch((e) => {
            reject(e);
        });
    }));
};
exports.transformReact2HTMLCSSDynamic = transformReact2HTMLCSSDynamic;
const createHeaderTags = (tagName, contents) => {
    return contents.map((item) => {
        const content = Object.keys(item).map((key) => {
            return `${key}="${item[key]}"`;
        });
        return `<${tagName} ${content.join(" ")} ${tagName === "script" ? "></script>" : ">"}`;
    });
};
exports.createHeaderTags = createHeaderTags;
const createHeaders = () => {
    var _a, _b, _c, _d;
    const versionMeta = config_1.config.version
        ? [`<meta name="generator" content="Rettle ${variable_1.version}">`]
        : [""];
    const headerMeta = config_1.config.header
        ? config_1.config.header.meta
            ? (0, exports.createHeaderTags)("meta", config_1.config.header.meta)
            : [""]
        : [""];
    const headerLink = ((_a = config_1.config.header) === null || _a === void 0 ? void 0 : _a.link)
        ? (0, exports.createHeaderTags)("link", (_b = config_1.config.header) === null || _b === void 0 ? void 0 : _b.link)
        : [""];
    const headerScript = ((_c = config_1.config.header) === null || _c === void 0 ? void 0 : _c.script)
        ? (0, exports.createHeaderTags)("script", (_d = config_1.config.header) === null || _d === void 0 ? void 0 : _d.script)
        : [""];
    return [...versionMeta, ...headerMeta, ...headerLink, ...headerScript];
};
exports.createHeaders = createHeaders;
const createHelmet = () => {
    const helmet = react_helmet_1.default.renderStatic();
    const heads = ["title", "base", "link", "meta", "script", "style"];
    const attributes = ["bodyAttributes", "htmlAttributes"];
    const body = ["noscript"];
    const results = {
        headers: [],
        attributes: {
            body: "",
            html: "",
        },
        body: [],
    };
    for (const opts of heads) {
        const opt = opts;
        if (helmet[opt]) {
            results.headers.push(helmet[opt].toString());
        }
    }
    results.attributes.body = helmet.bodyAttributes.toString() || "";
    results.attributes.html = helmet.htmlAttributes.toString() || "";
    for (const opts of body) {
        const opt = opts;
        if (helmet[opt]) {
            results.body.push(helmet[opt].toString());
        }
    }
    return results;
};
exports.createHelmet = createHelmet;
const compileHTML = (key, file, codes, dynamic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let style = "";
        const helmet = (0, exports.createHelmet)();
        const headers = (0, exports.createHeaders)().concat(helmet.headers);
        const root = key.replace(config_1.config.root, config_1.config.pathPrefix);
        const script = path.join("/", root, config_1.config.js);
        headers.push(`<link rel="stylesheet" href="${path.join("/", root, config_1.config.css)}">`);
        const markup = config_1.config.template({
            html: codes.html,
            headers,
            script,
            helmet: helmet.attributes,
            noScript: helmet.body,
        });
        style = style + codes.css;
        const exName = path.extname(file);
        let htmlOutputPath = path
            .join(config_1.config.outDir, config_1.config.pathPrefix, file.replace(config_1.config.root, ""))
            .replace(exName, ".html");
        if (dynamic) {
            const pattern = /\[(.*?)\]/;
            const result = htmlOutputPath.match(pattern);
            htmlOutputPath = result
                ? htmlOutputPath.replace(`[${result[1]}]`, dynamic)
                : htmlOutputPath;
        }
        yield (0, utility_1.mkdirp)(htmlOutputPath);
        const minifyHtml = yield (0, html_minifier_terser_1.minify)(markup, {
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            preserveLineBreaks: true,
        });
        const code = config_1.config.build.buildHTML(minifyHtml, htmlOutputPath);
        return Promise.resolve({ code, htmlOutputPath, style });
    }
    catch (e) {
        return Promise.reject(e);
    }
});
exports.compileHTML = compileHTML;
//# sourceMappingURL=HTMLBuilder.js.map