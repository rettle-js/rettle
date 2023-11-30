"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viteRettlePluginServer = (option) => ({
    name: "vite-plugin-rettle",
    apply: "serve",
    configureServer: (server) => {
    }
});
exports.default = viteRettlePluginServer;
