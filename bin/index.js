#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const server_1 = require("./module/server");
const build_1 = require("./module/build");
const program = new commander_1.Command();
program
    .option("-b, --build", "lunch build mode.", false);
program.parse();
const opts = program.opts();
if (opts.build) {
    (0, build_1.build)();
}
else {
    (0, server_1.server)();
}
//# sourceMappingURL=index.js.map