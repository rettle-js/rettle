#!/usr/bin/env node
"use strict";
import {Command} from "commander";
import {server} from "./module/server";
import {build} from "./module/build";

const program = new Command();

interface OptsInterface {
  build: boolean
}

program
  .option("-b, --build", "lunch build mode.", false)

program.parse();

const opts = program.opts() as OptsInterface;

if (opts.build) {
  build();
} else {
  server();
}