"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const template_html_1 = require("./template.html");
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
    define: {},
    version: true,
};
exports.defaultConfig = config;
