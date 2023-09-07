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
const config_1 = require("./config");
const vite_1 = require("vite");
const viteRettlePlugin_1 = require("./viteRettlePlugin");
const viteAdditionalStaticPlugin_1 = require("./viteAdditionalStaticPlugin");
const wakeupViteServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const vite = yield (0, vite_1.createServer)({
        plugins: [viteAdditionalStaticPlugin_1.viteAdditionalStaticPlugin, viteRettlePlugin_1.viteRettlePlugin],
        server: {
            port: config_1.config.server.port,
            host: config_1.config.server.host,
            watch: {
                usePolling: true,
            },
        },
        publicDir: config_1.config.static,
        base: config_1.config.pathPrefix,
        define: {
            "process.env": JSON.stringify(Object.assign(process.env, config_1.config.define)),
        },
    });
    yield vite.listen();
    vite.printUrls();
});
exports.wakeupViteServer = wakeupViteServer;
//# sourceMappingURL=viteServer.js.map