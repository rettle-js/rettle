"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { version } = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../../package.json"), "utf-8"));
exports.version = version;
