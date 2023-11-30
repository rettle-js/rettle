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
Object.defineProperty(exports, "__esModule", { value: true });
exports.wakeupViteServer = void 0;
const vite_1 = require("vite");
const viteRettlePlugin_1 = require("./viteRettlePlugin");
const viteAdditionalStaticPlugin_1 = require("./viteAdditionalStaticPlugin");
const wakeupViteServer = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const vite = yield (0, vite_1.createServer)({
        plugins: [
            (0, viteAdditionalStaticPlugin_1.viteAdditionalStaticPlugin)({
                server: options.server,
            }),
            (0, viteRettlePlugin_1.viteRettlePlugin)({
                root: options.root,
                static: options.static,
                pathPrefix: options.pathPrefix,
                dynamicRoutes: options.dynamicRoutes,
                js: options.js,
                template: options.template,
                version: options.version,
                header: options.header,
                esbuild: options.esbuild,
                define: options.define,
                beautify: options.beautify,
                endpoints: options.endpoints,
            }),
        ],
        server: {
            port: options.server.port,
            host: options.server.host,
            watch: {
                usePolling: true,
            },
        },
        publicDir: options.static,
        base: options.pathPrefix,
        define: {
            "process.env": JSON.stringify(process.env),
            define: JSON.stringify(options.define),
        },
    });
    yield vite.listen();
    vite.printUrls();
});
exports.wakeupViteServer = wakeupViteServer;
