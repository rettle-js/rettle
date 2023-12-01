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
const node_vm_1 = __importDefault(require("node:vm"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const node_html_parser_1 = require("node-html-parser");
const js_beautify_1 = __importDefault(require("js-beautify"));
const utility_1 = require("./utility");
const html_minifier_terser_1 = require("html-minifier-terser");
const buffer = __importStar(require("buffer"));
const module_1 = require("module");
const { dependencies } = JSON.parse(fs_1.default.readFileSync(path.resolve("./package.json"), "utf-8")) || {};
const insertCommentOut = (code, beautify) => {
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
            htmlArr.push(`<!--- ${beautify.html
                ? js_beautify_1.default.html(children, typeof beautify.html === "boolean" ? {} : beautify.html)
                : children} --->`);
        if (commentOutEnd !== "")
            htmlArr.push(commentOutEnd);
        HTML = HTML.replace(beforeHTML, htmlArr.join("\n"));
    }
    return HTML;
};
const transformReact2HTMLCSS = (targetPath, c) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        esBuild
            .build({
            bundle: true,
            entryPoints: [targetPath],
            platform: "node",
            write: false,
            external: Object.keys(dependencies || []),
            plugins: c.esbuild.plugins("server"),
            define: Object.assign({ "process.env": JSON.stringify(process.env) }, c.define),
        })
            .then((res) => {
            try {
                const code = res.outputFiles[0].text;
                const mod = new module_1.Module(targetPath);
                mod.filename = targetPath;
                mod.loaded = true;
                const context = node_vm_1.default.createContext({
                    exports,
                    module: mod,
                    process,
                    console,
                    require,
                    __filename,
                    __dirname,
                    Buffer,
                    global,
                    window: global,
                });
                node_vm_1.default.runInContext(code, context);
                const helmet = context.exports.onHelmet;
                const result = context.exports.default;
                result.helmet = helmet;
                const HTML = insertCommentOut(result.html, c.beautify);
                if (process.env.NODE_ENV !== "server" && c.beautify.html) {
                    result.html =
                        typeof c.beautify.html === "boolean"
                            ? js_beautify_1.default.html(HTML, {})
                            : js_beautify_1.default.html(HTML, c.beautify.html);
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
const transformReact2HTMLCSSDynamic = (path, id, c) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        esBuild
            .build({
            bundle: true,
            entryPoints: [path],
            platform: "node",
            write: false,
            external: Object.keys(dependencies),
            plugins: c.esbuild.plugins("server"),
            define: Object.assign({ "process.env": JSON.stringify(process.env) }, c.define),
        })
            .then((res) => {
            try {
                const code = res.outputFiles[0].text;
                const context = {
                    exports,
                    module,
                    process,
                    console,
                    require,
                    __filename,
                    __dirname,
                    Buffer: buffer.Buffer,
                };
                node_vm_1.default.runInNewContext(code, context);
                const createHelmet = context.exports.onHelmet;
                const dynamicRouteFunction = context.exports.default;
                const result = dynamicRouteFunction(id);
                if (createHelmet) {
                    result.helmet = createHelmet(id);
                }
                else {
                    result.helmet = {};
                }
                const HTML = insertCommentOut(result.html, c.beautify);
                if (process.env.NODE_ENV !== "server" && c.beautify.html) {
                    result.html =
                        typeof c.beautify.html === "boolean"
                            ? js_beautify_1.default.html(HTML, {})
                            : js_beautify_1.default.html(HTML, c.beautify.html);
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
const createHeaders = (version, header) => {
    const versionMeta = version
        ? [`<meta name="generator" content="Rettle ${version}">`]
        : [""];
    const headerMeta = header
        ? header.meta
            ? (0, exports.createHeaderTags)("meta", header.meta)
            : [""]
        : [""];
    const headerLink = (header === null || header === void 0 ? void 0 : header.link)
        ? (0, exports.createHeaderTags)("link", header === null || header === void 0 ? void 0 : header.link)
        : [""];
    const headerScript = (header === null || header === void 0 ? void 0 : header.script)
        ? (0, exports.createHeaderTags)("script", header === null || header === void 0 ? void 0 : header.script)
        : [""];
    return [...versionMeta, ...headerMeta, ...headerLink, ...headerScript];
};
exports.createHeaders = createHeaders;
const createHelmet = (helmet) => {
    var _a, _b;
    const title = "title";
    const heads = ["link", "meta", "script"];
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
    if (helmet) {
        if (helmet.title) {
            results.headers.push(`<title>${helmet[title]}</title>`);
        }
        for (const opts of heads) {
            if (helmet[opts]) {
                (_a = helmet[opts]) === null || _a === void 0 ? void 0 : _a.map((item) => {
                    let tag = Object.keys(item)
                        .map((t) => {
                        return `${t}="${item[t]}"`;
                    })
                        .join(" ");
                    results.headers.push(`<${opts} ${tag} />`);
                });
            }
        }
        results.attributes.body = helmet.bodyAttributes || "";
        results.attributes.html = helmet.htmlAttributes || "";
        for (const opts of body) {
            if (helmet[opts]) {
                (_b = helmet[opts]) === null || _b === void 0 ? void 0 : _b.map((item) => {
                    let tag = Object.keys(item)
                        .map((t) => {
                        if (t !== "innerText") {
                            return `${t}="${item[t]}"`;
                        }
                    })
                        .join(" ");
                    results.body.push(`<${opts} ${tag}>${item.innerText || ""}</${opts}>`);
                });
            }
        }
    }
    return results;
};
exports.createHelmet = createHelmet;
const compileHTML = (file, codes, assetsRoots, helmets, c, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let style = "";
        const helmet = (0, exports.createHelmet)(helmets);
        const headers = (0, exports.createHeaders)(c.version, c.header).concat(helmet.headers);
        const script = path.join(assetsRoots.js, c.js);
        headers.push(`<link rel="stylesheet" href="${path.join(assetsRoots.css, c.css)}">`);
        const markup = c.template({
            html: codes.html,
            headers,
            script,
            helmet: helmet.attributes,
            noScript: helmet.body,
            isModule: options.module || false,
        });
        style = style + codes.css;
        const exName = path.extname(file);
        let htmlOutputPath = path
            .join(c.outDir, c.pathPrefix, file.replace(c.root, ""))
            .replace(exName, ".html");
        if (options.dynamic) {
            const pattern = /\[(.*?)\]/;
            const result = htmlOutputPath.match(pattern);
            htmlOutputPath = result
                ? htmlOutputPath.replace(`[${result[1]}]`, options.dynamic)
                : htmlOutputPath;
        }
        if (!options.noDir) {
            yield (0, utility_1.mkdirp)(htmlOutputPath);
        }
        const minifyHtml = yield (0, html_minifier_terser_1.minify)(markup, {
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            preserveLineBreaks: true,
        });
        const code = c.build.buildHTML(minifyHtml, htmlOutputPath);
        return Promise.resolve({ code, htmlOutputPath, style });
    }
    catch (e) {
        return Promise.reject(e);
    }
});
exports.compileHTML = compileHTML;
