#!/usr/bin/env node
"use strict";
import { Command } from "commander";
import { server } from "./module/server";
import { build } from "./module/build";

const program = new Command();

interface OptsInterface {
  build: boolean;
  preview: boolean;
}

program
  .option("-b, --build", "lunch build mode.", false)
  .option("-p, --preview", "lunch preview build mode.", false);

program.parse();

const opts = program.opts() as OptsInterface;

if (opts.build) {
  process.env.NODE_ENV = "production";
  build();
} else if (opts.preview) {
  process.env.NODE_ENV = "development";
  build();
} else {
  process.env.NODE_ENV = "server";
  server();
}
