import path from "path";
import { config } from "../utils/config";
import glob from "glob";
import fs from "fs";
import {
  buildScript,
  createCacheAppFile,
  createTsConfigFile,
  outputFormatFiles,
} from "../utils/AppScriptBuilder";
import { getEntryPaths, mkdirp } from "../utils/utility";
import {
  transformReact2HTMLCSS,
  transformReact2HTMLCSSDynamic,
  compileHTML,
} from "../utils/HTMLBuilder";
import { deleteDir, copyStatic } from "../utils/directoryControl";
import js_beautify from "js-beautify";
import CleanCSS from "clean-css";

const resetDir = (dirRoot: string) => {
  return new Promise((resolve) => {
    if (fs.existsSync(dirRoot)) {
      deleteDir(dirRoot);
    }
    resolve(null);
  });
};

export const build = async () => {
  await Promise.all([
    resetDir(config.outDir),
    resetDir(".cache/src"),
    resetDir(".cache/scripts"),
    resetDir(".cache/temporary"),
  ]);
  /* build app.js files */
  const buildSetupOptions = {
    outDir: path.join(config.outDir, config.pathPrefix),
  };
  const srcFiles = glob.sync("./src/**/*{ts,js,tsx,jsx,json}", {
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
    await createCacheAppFile();
  } catch (e) {
    throw e;
  }
  try {
    await buildScript(buildSetupOptions);
  } catch (e) {
    throw e;
  }

  if (config.beautify.script) {
    const files = glob.sync(path.join(buildSetupOptions.outDir, "/**/*"), {
      nodir: true,
    });
    for (const file of files) {
      const code = fs.readFileSync(file, "utf-8");
      const beauty = js_beautify.js(
        code,
        typeof config.beautify.script === "boolean"
          ? {}
          : config.beautify.script
      );
      fs.writeFileSync(file, beauty);
    }
  }

  const jsFiles = glob.sync(
    path.join(config.outDir, config.pathPrefix, "/**/*.js"),
    {
      nodir: true,
    }
  );

  for (const js of jsFiles) {
    config.build.buildScript!(js);
  }

  // Create HTML FILES
  const entryPaths = getEntryPaths();
  Object.keys(entryPaths).map(async (key) => {
    const items = entryPaths[key];
    let styles = ``;
    await Promise.all(
      items.map(async (item) => {
        const pattern = /\[[^\]]*\]/;
        if (pattern.test(item)) {
          const relativePath = ("./" + item) as `./${string}`;
          if (config.dynamicRoutes) {
            if (config.dynamicRoutes[relativePath]) {
              const routeIsArray = Array.isArray(
                config.dynamicRoutes[relativePath]
              );
              const routingSetting = config.dynamicRoutes[relativePath];
              const requestData = routeIsArray
                ? (routingSetting as string[])
                : ((await (
                    routingSetting as () => Promise<string[]>
                  )()) as string[]);
              const promises = requestData.map((id) => {
                return new Promise(async (resolve) => {
                  const compileData = await transformReact2HTMLCSSDynamic(
                    item,
                    id
                  );
                  const { htmlOutputPath, code, style } = await compileHTML(
                    key,
                    item,
                    compileData,
                    id
                  );
                  styles = styles + style;
                  fs.writeFileSync(htmlOutputPath, code, "utf-8");
                  resolve(null);
                });
              });
              await Promise.all(promises);
            }
          }
        } else {
          const compileData = await transformReact2HTMLCSS(item);
          const { htmlOutputPath, code, style } = await compileHTML(
            key,
            item,
            compileData
          );
          styles = styles + style;
          fs.writeFileSync(htmlOutputPath, code, "utf-8");
        }
      })
    );
    const root = key.replace(config.root, "");
    const cssOutputPath = path.join(
      config.outDir,
      config.pathPrefix,
      root,
      config.css
    );
    const formattedStyle = new CleanCSS({
      level: {
        2: {
          overrideProperties: true,
        },
      },
    }).minify(styles);
    const beautyStyle = config.beautify.css
      ? typeof config.beautify.css === "boolean"
        ? js_beautify.css(formattedStyle.styles, {})
        : js_beautify.css(formattedStyle.styles, config.beautify.css)
      : formattedStyle.styles;
    const resultCss = config.build.buildCss!(beautyStyle, cssOutputPath);
    await mkdirp(cssOutputPath);
    fs.writeFileSync(cssOutputPath, resultCss, "utf-8");
  });
  await copyStatic();
  config.build.copyStatic!();
};
