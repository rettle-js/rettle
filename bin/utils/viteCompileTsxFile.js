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
const config_1 = require("./config");
const compileTsx = (tsxPath) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { html, css, ids } = yield (0, HTMLBuilder_1.transformReact2HTMLCSS)(tsxPath);
            const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
            const helmet = (0, HTMLBuilder_1.createHelmet)();
            const headers = (0, HTMLBuilder_1.createHeaders)().concat(helmet.headers);
            const endpoint = (0, utility_1.checkEndpoint)(tsxPath);
            const script = path_1.default.join("/.cache/scripts", endpoint || "", config_1.config.js);
            const result = config_1.config.template({
                html,
                style,
                headers,
                script,
                helmet: helmet.attributes,
                noScript: helmet.body,
                mode: "server",
            });
            resolve(result);
        }
        catch (e) {
            reject(e);
        }
    }));
};
exports.compileTsx = compileTsx;
const compileDynamicTsx = (tsxPath, id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { html, css, ids } = yield (0, HTMLBuilder_1.transformReact2HTMLCSSDynamic)(tsxPath, id);
            const style = `<style data-emotion="${ids.join(" ")}">${css}</style>`;
            const helmet = (0, HTMLBuilder_1.createHelmet)();
            const headers = (0, HTMLBuilder_1.createHeaders)().concat(helmet.headers);
            const endpoint = (0, utility_1.checkEndpoint)(tsxPath);
            const script = path_1.default.join("/.cache/scripts", endpoint || "", config_1.config.js);
            const result = config_1.config.template({
                html,
                style,
                headers,
                script,
                helmet: helmet.attributes,
                noScript: helmet.body,
                mode: "server",
            });
            resolve(result);
        }
        catch (e) {
            reject(e);
        }
    }));
};
exports.compileDynamicTsx = compileDynamicTsx;
//# sourceMappingURL=viteCompileTsxFile.js.map