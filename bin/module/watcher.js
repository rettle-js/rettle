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
exports.watchFiles = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const path = __importStar(require("path"));
const watchFiles = (args) => {
    const srcAllFilesPath = path.resolve("./src/**/*.{ts,tsx,js,jsx}");
    const watcher = chokidar_1.default.watch(srcAllFilesPath, {
        persistent: true,
        awaitWriteFinish: true,
        usePolling: true,
    });
    watcher.on("ready", () => {
        if (args.ready) {
            args.ready(watcher);
        }
        watcher.on("change", (filename, status) => {
            if (args.change) {
                args.change(filename, watcher);
            }
        });
        watcher.on("add", (filename, status) => {
            if (args.add) {
                args.add(filename, watcher);
            }
        });
        watcher.on("addDir", (filename, status) => {
            if (args.add) {
                args.add(filename, watcher);
            }
        });
        watcher.on("unlink", (filename) => {
            if (args.unlink) {
                args.unlink(filename, watcher);
            }
        });
        watcher.on("unlinkDir", (filename) => {
            if (args.unlinkDir) {
                args.unlinkDir(filename, watcher);
            }
        });
    });
    return watcher;
};
exports.watchFiles = watchFiles;
