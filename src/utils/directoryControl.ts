import fs from "fs";
import {config} from "./config";
import * as path from "path";
import {rimrafSync} from "rimraf";
import glob from "glob";
import {mkdirp} from "./utility";

export const copyStatic = async() => {
  const files = glob.sync(path.resolve(path.join("./", config.static,"**/*")), {
    nodir: true
  })
  for (const file of files) {
    const before = path.join("/", config.static);
    const after = path.join("/", config.outDir, config.pathPrefix)
    const outputPath = path.relative("./", file.replace(before, after));
    mkdirp(outputPath).then(() => {
      fs.copyFileSync(file, outputPath)
    })
  }
}

export const deleteDir = (root: string) => {
  rimrafSync(root);
}