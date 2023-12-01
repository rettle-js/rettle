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
exports.compileDynamicTsx = exports.compileTsx = void 0;
const HTMLBuilder_1 = require("./HTMLBuilder");
const utility_1 = require("./utility");
const path_1 = __importDefault(require("path"));
const compileTsx = (tsxPath, c) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { html, css, ids, helmet: helmets, } = yield (0, HTMLBuilder_1.transformReact2HTMLCSS)(tsxPath, {
                esbuild: c.esbuild,
                define: c.define,
                beautify: c.beautify,
            });
            const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
            const helmet = (0, HTMLBuilder_1.createHelmet)(helmets);
            const headers = (0, HTMLBuilder_1.createHeaders)(c.version, c.header).concat(helmet.headers);
            const endpoint = (0, utility_1.checkEndpoint)(tsxPath, c.endpoints, c.root);
            const script = path_1.default.join("/.cache/scripts", endpoint || "", c.js);
            const result = c.template({
                html,
                style,
                headers,
                script,
                helmet: helmet.attributes,
                noScript: helmet.body,
                isModule: true,
            });
            resolve(result);
        }
        catch (e) {
            reject(e);
        }
    }));
};
exports.compileTsx = compileTsx;
const compileDynamicTsx = (tsxPath, id, c) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { html, css, ids, helmet } = yield (0, HTMLBuilder_1.transformReact2HTMLCSSDynamic)(tsxPath, id, {
                define: c.define,
                esbuild: c.esbuild,
                beautify: c.beautify,
            });
            const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
            const helmets = (0, HTMLBuilder_1.createHelmet)(helmet);
            const headers = (0, HTMLBuilder_1.createHeaders)(c.version, c.header).concat(helmets.headers);
            const endpoint = (0, utility_1.checkEndpoint)(tsxPath, c.endpoints, c.root);
            const script = path_1.default.join("/.cache/scripts", endpoint || "", c.js);
            const result = c.template({
                html,
                style,
                headers,
                script,
                helmet: helmets.attributes,
                noScript: helmets.body,
                isModule: true,
            });
            resolve(result);
        }
        catch (e) {
            reject(e);
        }
    }));
};
exports.compileDynamicTsx = compileDynamicTsx;
