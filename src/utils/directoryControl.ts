import fs from "fs";
import * as path from "path";
import { rimrafSync } from "rimraf";
import glob from "glob";
import { mkdirp } from "./utility";
import { RettleConfigInterface } from "./config";

export const copyStatic = async (
  staticDir: RettleConfigInterface<any>["static"],
  outDir: RettleConfigInterface<any>["outDir"],
  pathPrefix: RettleConfigInterface<any>["pathPrefix"]
) => {
  const files = glob.sync(path.resolve(path.join("./", staticDir, "**/*")), {
    nodir: true,
  });
  for (const file of files) {
    const before = path.join("/", staticDir);
    const after = path.join("/", outDir, pathPrefix);
    const outputPath = path.relative("./", file.replace(before, after));
    mkdirp(outputPath).then(() => {
      fs.copyFileSync(file, outputPath);
    });
  }
};

export const deleteDir = (root: string) => {
  rimrafSync(root);
};
