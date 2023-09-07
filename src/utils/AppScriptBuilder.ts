import esBuild from "esbuild";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import tsConfig from "./template-tsconfig.json";
import { getDependencies, getMadgeObject, checkScript } from "./Dependencies";
import { config, getIgnores } from "./config";
import glob from "glob";
import { mkdirp } from "./utility";
import * as acorn from "acorn";
import jsx from "acorn-jsx";
import ts from "typescript";
import { createHash, getFilesName } from "./utility";
import deepmerge from "deepmerge";
import { isPlainObject } from "is-plain-object";
import {
  prepareSingleFileReplaceTscAliasPaths,
  SingleFileReplacer,
} from "tsc-alias";

interface BuildScriptInterface {
  outDir: string;
}

export const createTsConfigFile = () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(path.resolve(".cache"))) {
      fs.mkdirSync(path.resolve(".cache"));
    }
    fs.writeFileSync(
      path.resolve("./.cache/tsconfig.json"),
      JSON.stringify(tsConfig, null, 2),
      "utf-8"
    );
    resolve(null);
  });
};

const createFileName = (filePath: string) => {
  const relativePath = path
    .relative(path.resolve(config.root), filePath)
    .replace("/**/*", "")
    .replace("**/*", "");
  return relativePath;
};

const createComponentDep = async (filepath: string) => {
  let results = {} as { [x in string]: any };
  const tempObj = await getMadgeObject(filepath, {
    baseDir: "./",
    tsConfig: path.resolve("./tsconfig.json"),
  });
  let obj = tempObj[filepath];
  for (const dep of obj) {
    if (checkScript(dep)) {
      const temp = await createComponentDep(dep);
      results = deepmerge(
        results,
        {
          [getFilesName(dep)]: `createComponent("${createHash(
            path.resolve(dep)
          )}", Script_${createScriptHash(dep)}("${createHash(
            path.resolve(dep)
          )}", {${temp}})),`,
        },
        { isMergeableObject: isPlainObject }
      );
    } else {
      const temp = await createComponentDep(dep);
      results = deepmerge(
        results,
        {
          [getFilesName(dep)]: `{${temp}},`,
        },
        { isMergeableObject: isPlainObject }
      );
    }
  }
  return Object.keys(results)
    .map((item) => {
      return `${item}: ${results[item]}`;
    })
    .join("\n");
};

const createScriptHash = (str: string) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

export const createCacheAppFile = () => {
  return new Promise(async (resolve) => {
    const jsFileName = path.basename(config.js).replace(".js", "");
    const jsBaseDir = path.dirname(config.js);
    for (const endpoint of config.endpoints) {
      const rootEndpoint = path.join(config.root, endpoint);
      const ignore = getIgnores(rootEndpoint);
      const files = await getDependencies(rootEndpoint, ignore);
      const appResolvePath = createFileName(rootEndpoint);
      const appFilePath = path.join(
        ".cache/scripts",
        appResolvePath,
        jsBaseDir,
        `${jsFileName}.js`
      );
      const appImports = [`import {RettleStart} from "rettle/core";`];
      const scriptObject = [];
      const scriptRunner = [`RettleStart(clients, {})`];
      const defs = [];
      for (const file of files) {
        const hash = createHash(path.resolve(file));
        const hashName = createScriptHash(file);
        appImports.push(
          `import {client as Client_${hashName}} from "${path
            .relative(
              path.resolve(
                path.join(".cache/scripts", appResolvePath, jsBaseDir)
              ),
              file.replace("src/", ".cache/src/")
            )
            .replace(".tsx", "")
            .replace(".jsx", "")}";`
        );
        scriptObject.push(`"${hash}": Client_${hashName}`);
      }
      await mkdirp(appFilePath);
      const code = [
        appImports.join("\n"),
        `const clients = {${scriptObject.join(",\n")}};`,
        scriptRunner.join("\n"),
      ];
      fs.writeFileSync(appFilePath, code.join("\n"), "utf-8");
    }
    resolve(null);
  });
};

export const buildScript = ({ outDir }: BuildScriptInterface) => {
  return new Promise((resolve) => {
    const files = glob.sync(path.resolve("./.cache/scripts/**/*.js"), {
      nodir: true,
    });
    esBuild
      .build({
        bundle: true,
        // all cache scripts
        entryPoints: files,
        // If only one file is used, the directory structure is not reproduced, so separate the files.
        outdir:
          files.length <= 1
            ? path.join(outDir, path.dirname(config.js))
            : outDir,
        sourcemap: process.env.NODE_ENV !== "production",
        platform: "browser",
        target: "es6",
        tsconfig: ".cache/tsconfig.json",
        define: {
          "process.env": JSON.stringify(config.define),
        },
        minify: true,
      })
      .then(() => {
        resolve(null);
      });
  });
};

export const watchScript = ({ outDir }: BuildScriptInterface) => {
  return new Promise((resolve) => {
    const files = glob.sync(path.resolve("./.cache/scripts/**/*.js"), {
      nodir: true,
    });
    esBuild
      .build({
        bundle: true,
        watch: {
          onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
          },
        },
        entryPoints: files,
        outdir:
          files.length <= 1
            ? path.join(outDir, path.dirname(config.js))
            : outDir,
        sourcemap: process.env.NODE_ENV !== "production",
        platform: "browser",
        target: "es6",
        tsconfig: ".cache/tsconfig.json",
        define: {
          "process.env": JSON.stringify(config.define),
        },
        plugins: config.esbuild.plugins!("client"),
      })
      .then(() => {
        resolve(null);
      });
  });
};

export const translateTs2Js = (code: string) => {
  return ts.transpileModule(code, {
    compilerOptions: {
      target: 99,
      jsx: 2,
    },
  }).outputText;
};

export const eraseExports = async (code: string) => {
  try {
    const jsCode = translateTs2Js(code);
    //@ts-ignore
    const ast = acorn.Parser.extend(jsx()).parse(jsCode, {
      ecmaVersion: 2019,
      sourceType: "module",
    });
    // @ts-ignore
    const importNodes = ast.body.filter(
      (item: any) =>
        item.type === "ImportDeclaration" &&
        (item.source.value === "react" || item.source.raw === "react")
    );
    //@ts-ignore
    const functionNodes = ast.body.filter(
      (item: any) =>
        item.type === "FunctionDeclaration" ||
        item.type === "VariableDeclaration"
    );
    //@ts-ignore
    const defaultExportNodes = ast.body.filter(
      (item: any) => item.type === "ExportDefaultDeclaration"
    );
    const objects: Record<string, string> = {};
    if (!defaultExportNodes) throw new Error("Cannot Found export");
    if (!defaultExportNodes[0]) throw new Error("Cannot Found export");
    if ("declaration" in defaultExportNodes[0] === false)
      throw new Error("Cannot Found export");
    if (defaultExportNodes[0].declaration.name) {
      // export default **
      for (const node of functionNodes) {
        const { start, end } = node;
        const text = jsCode.slice(start, end);
        if (node.type === "FunctionDeclaration") {
          const key = node.id.name;
          objects[key] = text;
        } else if (node.type === "VariableDeclaration") {
          const key = node.declarations[0].id.name;
          objects[key] = text;
        }
      }
      const exportName = defaultExportNodes[0].declaration.name;
      const exportLine = jsCode.slice(
        defaultExportNodes[0].start,
        defaultExportNodes[0].end
      );
      const result = jsCode
        .replace(objects[exportName], "")
        .replace(exportLine, "export default () => {}");
      return translateTs2Js(result);
    } else {
      // export default ()=>
      let replaceDefaultRettle = "";
      let names: string[] = [];
      let cacheName = "";
      if (defaultExportNodes[0]) {
        if (defaultExportNodes[0].declaration) {
          if (defaultExportNodes[0].declaration.arguments) {
            for (const argument of defaultExportNodes[0].declaration
              .arguments) {
              if (argument) {
                if (argument.name) {
                  names.push(argument.name);
                }
                if (argument.callee) {
                  if (argument.callee.name) {
                    names.push(argument.callee.name);
                  }
                }
              }
            }
          }
        }
      }
      if (names.length > 0) {
        for (const node of functionNodes) {
          const { start, end } = node;
          const text = jsCode.slice(start, end);
          if (node.declarations[0].init.callee) {
            let cache = node.declarations[0].init.callee.property
              ? node.declarations[0].init.callee.property.name
              : node.declarations[0].init.callee.name;
            if (cache === "createCache") {
              cacheName = node.declarations[0].id.name;
            }
          }
          if (node.type === "FunctionDeclaration") {
            const key = node.id.name;
            objects[key] = text;
          } else if (node.type === "VariableDeclaration") {
            const key = node.declarations[0].id.name;
            objects[key] = text;
          }
        }
        replaceDefaultRettle = jsCode;
        for (const name of names) {
          if (objects[name]) {
            replaceDefaultRettle = replaceDefaultRettle.replace(
              objects[name],
              ""
            );
          }
        }
        replaceDefaultRettle = replaceDefaultRettle.replace(
          objects[cacheName],
          ""
        );
      } else {
        replaceDefaultRettle = jsCode;
      }
      const exportName = defaultExportNodes[0];
      const { start, end } = exportName;
      const exportStr = jsCode.slice(start, end);
      const result =
        replaceDefaultRettle.replace(exportStr, "") +
        "\nexport default () => {};";
      return translateTs2Js(result);
    }
    return "";
  } catch (e) {
    throw e;
  }
};

function treatFile(
  filePath: string,
  code: string,
  runFile: SingleFileReplacer
) {
  const newContents = runFile({ fileContents: code, filePath });
  fs.writeFileSync(filePath, newContents);
}

export const outputFormatFiles = (file: string) => {
  return new Promise(async (resolve, reject) => {
    const replacer = await prepareSingleFileReplaceTscAliasPaths({
      outDir: "./.cache/src",
    });
    try {
      const filePath = path.isAbsolute(file) ? path.relative("./", file) : file;
      const outPath = path.join(".cache/", filePath).replace(/\.ts(x)?/, ".js");
      const sourceCode = fs.readFileSync(filePath, "utf-8");
      await mkdirp(outPath);
      if (path.extname(filePath).includes("tsx")) {
        const code = await eraseExports(sourceCode);
        fs.writeFileSync(outPath, "", "utf-8");
        treatFile(outPath, code, replacer);
      } else {
        const code = translateTs2Js(sourceCode);
        fs.writeFileSync(outPath, "", "utf-8");
        treatFile(outPath, code, replacer);
      }
      resolve(null);
    } catch (e) {
      reject(e);
    }
  });
};
