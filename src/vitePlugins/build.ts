import { Plugin, UserConfig } from "vite";
import { RettleOptions } from "../vite";
import { getEntryPaths, mkdirp, resetDir } from "../utils/utility";
import * as path from "node:path";
import deepmerge from "deepmerge";
import { compileHTML, transformReact2HTMLCSS } from "../utils/HTMLBuilder";
import { defaultConfig } from "../utils/defaultConfigure";
import * as fs from "node:fs";
import glob from "glob";
import {
  createCacheAppFile,
  createTsConfigFile,
  outputFormatFiles,
} from "../utils/AppScriptBuilder";

const viteRettlePluginBuild = (option: RettleOptions): Plugin => {
  let userConfig: UserConfig;
  const resourceMap: {
    [index: string]: {
      path: string;
      key: string;
      relativePath: string;
    };
  } = {};
  const fileMap: {
    [index: string]: {
      file: string;
      key: string;
      relativePath: string;
    };
  } = {};
  return {
    name: "vite-plugin-rettle",
    apply: "build",
    buildStart: async () => {
      try {
        await Promise.all([
          resetDir(path.resolve("./.cache/src")),
          resetDir(path.resolve("./.cache/scripts")),
          resetDir(path.resolve("./.cache/temporary")),
          resetDir(path.resolve("./.cache/style")),
        ]);
        const srcFiles = glob.sync(`./src/**/*{ts,js,tsx,jsx,json}`, {
          nodir: true,
        });
        await Promise.all(
          srcFiles.map(
            (file) =>
              new Promise(async (resolve, reject) => {
                try {
                  await outputFormatFiles(file);
                  resolve(null);
                } catch (e) {
                  reject(e);
                }
              })
          )
        );
        try {
          await createTsConfigFile();
        } catch (e) {
          throw e;
        }

        try {
          await createCacheAppFile({
            js: defaultConfig.js,
            endpoints: defaultConfig.endpoints,
            root: path.join(userConfig.root || "/", option.routes),
          });
        } catch (e) {
          throw e;
        }
      } catch (e) {
        console.log("Error", e);
      }
    },
    config: (config) => {
      userConfig = config;
    },
    options: (InputOption) => {
      const root = path.join("./", userConfig.root || "/", option.routes);
      const entryPaths = getEntryPaths(root, ["/"]);
      const overrideInput: {
        input: {
          [index: string]: string;
        };
      } = {
        input: {},
      };
      Object.keys(entryPaths).map((key) => {
        const items = entryPaths[key];
        items.map((item) => {
          item = path.resolve("./", item);
          const filename = path.basename(item);
          const relativePath =
            path
              .join(path.relative(root, item))
              .replace(`${filename}`, "")
              .slice(0, -1) || "main";
          const dummyPath = path.resolve(
            path.join(item.replace(option.routes, ""))
          );
          fileMap[dummyPath] = {
            file: "",
            key: "",
            relativePath: "",
          };
          fileMap[dummyPath].file = item;
          fileMap[dummyPath].key = key;
          fileMap[dummyPath].relativePath = relativePath;
          overrideInput.input[relativePath] = dummyPath;
        });
      });
      return deepmerge(InputOption, overrideInput);
    },
    resolveId: (id) => {
      if (id.endsWith(".tsx")) {
        const filePath = fileMap[id];
        const dummy = id.replace(".tsx", ".html");
        resourceMap[dummy] = {
          path: "",
          key: "",
          relativePath: "",
        };
        resourceMap[dummy].path = path.resolve(filePath.file);
        resourceMap[dummy].key = filePath.key;
        resourceMap[dummy].relativePath = filePath.relativePath;
        return dummy;
      }
    },
    load: async (id) => {
      if (id in resourceMap) {
        try {
          const item = resourceMap[id];
          const compileData = await transformReact2HTMLCSS(item.path, {
            esbuild: defaultConfig.esbuild,
            define: userConfig.define,
            beautify: defaultConfig.beautify,
          });
          const jsResolvePath = path.dirname(
            path.resolve(path.join("./.cache/scripts", defaultConfig.js))
          );
          const jsPath = {
            root: jsResolvePath.replace(path.resolve("./"), ""),
            name: "app.js",
          };
          const cssResolvePath = path.resolve(
            path.join("./.cache/style", item.relativePath)
          );
          const cssPath = {
            root: cssResolvePath.replace(path.resolve("./"), ""),
            name: "app.css",
          };
          const { htmlOutputPath, code, style } = await compileHTML(
            item.path,
            compileData,
            {
              js: `/${jsPath.root}`,
              css: `/${cssPath.root}`,
            },
            compileData.helmet,
            {
              root: option.routes,
              pathPrefix: userConfig.base || "/",
              js: jsPath.name,
              css: cssPath.name,
              template: option.template,
              version: option.version,
              header: {},
              outDir: userConfig.build?.outDir || "dist",
              esbuild: defaultConfig.esbuild,
              build: option.buildHook,
            },
            {
              noDir: true,
              module: true,
            }
          );
          const stylePath = path.join(cssResolvePath, cssPath.name);
          fs.mkdirSync(cssResolvePath, {
            recursive: true,
          });
          fs.writeFileSync(stylePath, style, "utf8");
          if (typeof code === "string") {
            return code;
          } else {
            return code.toString();
          }
        } catch (e) {
          console.log("Error: ", e);
        }
      }
    },
  };
};

export default viteRettlePluginBuild;
