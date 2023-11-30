"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = void 0;
const target = {
    blue: "\u001b[34m",
    normal: "\u001b[0m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m"
};
exports.color = new Proxy(target, {
    get: (target, prop) => {
        return (log) => {
            return `${target[prop]}${log}\u001b[0m`;
        };
    }
});
