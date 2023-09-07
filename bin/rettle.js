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
exports.createDynamicRoute = exports.createCache = exports.defineOption = exports.createRettle = exports.CommentOut = exports.Component = void 0;
const cache_1 = __importDefault(require("@emotion/cache"));
const server_1 = __importDefault(require("react-dom/server"));
const create_instance_1 = __importDefault(require("@emotion/server/create-instance"));
const React = __importStar(require("react"));
const react_1 = require("@emotion/react");
const defineOption = (options) => {
    return options;
};
exports.defineOption = defineOption;
const createCache = (key) => (0, cache_1.default)({ key });
exports.createCache = createCache;
const createRettle = (element, cache = createCache("css")) => {
    const html = React.createElement(react_1.CacheProvider, { value: cache }, element);
    const { extractCritical } = (0, create_instance_1.default)(cache);
    return extractCritical(server_1.default.renderToString(html));
};
exports.createRettle = createRettle;
const createDynamicRoute = (routing, Application, cache = createCache("css")) => {
    return (id) => {
        const html = React.createElement(react_1.CacheProvider, { value: cache }, React.createElement(Application, Object.assign({}, routing(id))));
        const { extractCritical } = (0, create_instance_1.default)(cache);
        return extractCritical(server_1.default.renderToString(html));
    };
};
exports.createDynamicRoute = createDynamicRoute;
const Component = new Proxy({}, {
    get: (_, key) => {
        return (props) => {
            const prop = Object.keys(props).reduce((objAcc, key) => {
                // 累積オブジェクトにキーを追加して、値を代入
                if (key !== "frame" &&
                    key !== "css" &&
                    key !== "children" &&
                    key !== "clientKey") {
                    objAcc[key] = props[key];
                }
                // 累積オブジェクトを更新
                return objAcc;
            }, {});
            const clientKey = props.clientKey
                ? {
                    "data-client-key": props.clientKey,
                }
                : {};
            return React.createElement(key, Object.assign(prop, Object.assign({ "data-rettle-fr": props.frame }, clientKey)), props.children);
        };
    },
});
exports.Component = Component;
const CommentOut = (props) => {
    return React.createElement("span", {
        "comment-out-begin": props.begin || "none",
        "comment-out-end": props.end || "none",
        "data-comment-out": true,
    }, props.children);
};
exports.CommentOut = CommentOut;
//# sourceMappingURL=rettle.js.map