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
exports.viteAdditionalStaticPlugin = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const vite_1 = require("vite");
const glob_1 = __importDefault(require("glob"));
const mime_types_1 = __importDefault(require("mime-types"));
const addStaticFiles = {};
const viteAdditionalStaticPlugin = (c) => {
    return {
        name: "vite-plugin-additional-static",
        apply: "serve",
        configureServer(server) {
            if (c.server.listenDir) {
                for (const dir of c.server.listenDir) {
                    const listenFiles = glob_1.default.sync(path_1.default.join(dir, "/**/*"), {
                        nodir: true,
                    });
                    for (const file of listenFiles) {
                        const resolveFile = path_1.default.resolve(file);
                        addStaticFiles[file] = fs_1.default.readFileSync(resolveFile);
                    }
                }
            }
            server.middlewares.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
                if (req.url && c.server.listenDir) {
                    const requestURL = req.url.split("?")[0].split("#")[0];
                    for (const dir of c.server.listenDir) {
                        const requestFullFilePath = path_1.default.join(path_1.default.resolve(dir), requestURL);
                        if (addStaticFiles[requestFullFilePath]) {
                            const type = mime_types_1.default.lookup(requestURL);
                            return (0, vite_1.send)(req, res, addStaticFiles[requestFullFilePath], "", {
                                headers: {
                                    "Content-Type": String(type),
                                },
                            });
                        }
                    }
                }
                else {
                    next();
                }
            }));
        },
    };
};
exports.viteAdditionalStaticPlugin = viteAdditionalStaticPlugin;
