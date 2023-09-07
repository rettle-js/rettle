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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const template_html_1 = require("./template.html");
const process = __importStar(require("process"));
const esbuild_plugin_rettle_1 = __importDefault(require("esbuild-plugin-rettle"));
const config = {
    pathPrefix: "/",
    outDir: "./htdocs",
    static: "./static",
    css: "/assets/style/app.css",
    js: "/assets/script/app.js",
    beautify: {},
    template: template_html_1.templateHtml,
    root: "src/views/",
    endpoints: ["/"],
    build: {
        buildHTML: (code) => code,
        buildCss: (code) => code,
        buildScript: () => { },
        copyStatic: () => { },
    },
    esbuild: {
        plugins: (mode) => {
            return [
                (0, esbuild_plugin_rettle_1.default)({
                    filter: /./,
                    mode: mode,
                    babel: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-typescript",
                            [
                                "@babel/preset-react",
                                {
                                    runtime: "automatic",
                                    importSource: "@emotion/react",
                                },
                            ],
                        ],
                        plugins: [
                            [
                                "@emotion/babel-plugin",
                                {
                                    labelFormat: "[filename]_[local]",
                                },
                            ],
                        ],
                    },
                }),
            ];
        },
    },
    server: {
        port: 3000,
        host: "0.0.0.0",
    },
    define: {
        NODE_ENV: process.env.NODE_ENV,
    },
    version: true,
};
exports.defaultConfig = config;
//# sourceMappingURL=defaultConfigure.js.map