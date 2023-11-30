import * as esBuild from "esbuild";
import vm from "node:vm";
import fs from "fs";
import * as path from "path";
import { RettleConfigInterface } from "./config";
import Helmet from "react-helmet";
import { parse } from "node-html-parser";
import js_beautify from "js-beautify";
import { mkdirp } from "./utility";
import { minify } from "html-minifier-terser";
import * as buffer from "buffer";
import { Module } from "module";

interface HelmetType {
  title: string;
  bodyAttributes: string;
  htmlAttributes: string;
  meta: { [index: string]: string }[];
  script: { [index: string]: string }[];
  link: { [index: string]: string }[];
  noscript: {
    [index: string]: string;
    innerText: string;
  }[];
}

const { dependencies } =
  JSON.parse(fs.readFileSync(path.resolve("./package.json"), "utf-8")) || {};

const insertCommentOut = (
  code: string,
  beautify: RettleConfigInterface<any>["beautify"]
) => {
  const root = parse(code);
  let HTML = root.toString();
  const articles = root.querySelectorAll("[data-comment-out]");
  for (const article of articles) {
    const beforeHTML = article.toString();
    const beginComment = article.getAttribute("comment-out-begin");
    const endComment = article.getAttribute("comment-out-end");
    const commentOutBegin =
      beginComment !== "none" ? `<!--- ${beginComment} --->` : "";
    const commentOutEnd =
      endComment !== "none" ? `<!--- ${endComment} --->` : "";
    let children: string = "";
    for (const child of article.childNodes) {
      children += child.toString();
    }
    const htmlArr = [];
    if (commentOutBegin !== "") htmlArr.push(commentOutBegin);
    if (article.childNodes.length !== 0)
      htmlArr.push(
        `<!--- ${
          beautify.html
            ? js_beautify.html(
                children,
                typeof beautify.html === "boolean" ? {} : beautify.html
              )
            : children
        } --->`
      );
    if (commentOutEnd !== "") htmlArr.push(commentOutEnd);
    HTML = HTML.replace(beforeHTML, htmlArr.join("\n"));
  }
  return HTML;
};

export const transformReact2HTMLCSS = (
  targetPath: string,
  c: {
    esbuild: RettleConfigInterface<any>["esbuild"];
    define: RettleConfigInterface<any>["define"];
    beautify: RettleConfigInterface<any>["beautify"];
  }
): Promise<{
  html: string;
  ids: Array<string>;
  css: string;
  helmet: HelmetType;
}> => {
  return new Promise(async (resolve, reject) => {
    esBuild
      .build({
        bundle: true,
        entryPoints: [targetPath],
        platform: "node",
        write: false,
        external: Object.keys(dependencies || []),
        plugins: c.esbuild.plugins!("server"),
        define: {
          "process.env": JSON.stringify(process.env),
          ...c.define,
        },
      })
      .then((res) => {
        try {
          const code = res.outputFiles![0].text;
          const mod = new Module(targetPath);
          mod.filename = targetPath;
          mod.loaded = true;
          const context = vm.createContext({
            exports,
            module: mod,
            process,
            console,
            require,
            __filename,
            __dirname,
            Buffer,
            global,
            window: global,
          });
          vm.runInContext(code, context);
          const helmet = context.exports.onHelmet as HelmetType;
          const result = context.exports.default as {
            html: string;
            ids: string[];
            css: string;
            helmet: HelmetType;
          };
          result.helmet = helmet;
          const HTML = insertCommentOut(result.html, c.beautify);
          if (process.env.NODE_ENV !== "server" && c.beautify.html) {
            result.html =
              typeof c.beautify.html === "boolean"
                ? js_beautify.html(HTML, {})
                : js_beautify.html(HTML, c.beautify.html);
          } else {
            result.html = HTML;
          }
          if ("html" in result && "css" in result && "ids" in result) {
            resolve(result);
          } else {
            reject(
              new Error(`${path}: The value of export default is different.`)
            );
          }
        } catch (e) {
          reject(e);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const transformReact2HTMLCSSDynamic = (
  path: string,
  id: string,
  c: {
    define: RettleConfigInterface<any>["define"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    beautify: RettleConfigInterface<any>["beautify"];
  }
): Promise<{ html: string; ids: Array<string>; css: string }> => {
  return new Promise(async (resolve, reject) => {
    esBuild
      .build({
        bundle: true,
        entryPoints: [path],
        platform: "node",
        write: false,
        external: Object.keys(dependencies),
        plugins: c.esbuild.plugins!("server"),
        define: {
          "process.env": JSON.stringify(process.env),
          ...c.define,
        },
      })
      .then((res) => {
        try {
          const code = res.outputFiles![0].text;
          const context = {
            exports,
            module,
            process,
            console,
            require,
            __filename,
            __dirname,
            Buffer: buffer.Buffer,
          };
          vm.runInNewContext(code, context);
          const dynamicRouteFunction = context.module.exports.default as (
            id: string
          ) => {
            html: string;
            ids: Array<string>;
            css: string;
          };
          const result = dynamicRouteFunction(id);
          const HTML = insertCommentOut(result.html, c.beautify);
          if (process.env.NODE_ENV !== "server" && c.beautify.html) {
            result.html =
              typeof c.beautify.html === "boolean"
                ? js_beautify.html(HTML, {})
                : js_beautify.html(HTML, c.beautify.html);
          } else {
            result.html = HTML;
          }
          if ("html" in result && "css" in result && "ids" in result) {
            resolve(result);
          } else {
            reject(
              new Error(`${path}: The value of export default is different.`)
            );
          }
        } catch (e) {
          reject(e);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const createHeaderTags = (
  tagName: string,
  contents: Record<string, string | number | boolean>[]
) => {
  return contents.map((item: any) => {
    const content = Object.keys(item).map((key) => {
      return `${key}="${item[key]}"`;
    });
    return `<${tagName} ${content.join(" ")} ${
      tagName === "script" ? "></script>" : ">"
    }`;
  });
};

export const createHeaders = (
  version: RettleConfigInterface<any>["version"],
  header: RettleConfigInterface<any>["header"]
) => {
  const versionMeta = version
    ? [`<meta name="generator" content="Rettle ${version}">`]
    : [""];
  const headerMeta = header
    ? header.meta
      ? createHeaderTags("meta", header.meta)
      : [""]
    : [""];
  const headerLink = header?.link
    ? createHeaderTags("link", header?.link)
    : [""];
  const headerScript = header?.script
    ? createHeaderTags("script", header?.script)
    : [""];
  return [...versionMeta, ...headerMeta, ...headerLink, ...headerScript];
};
interface RettleHelmetType {
  headers: string[];
  attributes: {
    body: string;
    html: string;
  };
  body: string[];
}
export const createHelmet = (helmet: HelmetType) => {
  const title = "title";
  const heads = ["link", "meta", "script"] as const;
  const attributes = ["bodyAttributes", "htmlAttributes"] as const;
  const body = ["noscript"] as const;
  const results: RettleHelmetType = {
    headers: [],
    attributes: {
      body: "",
      html: "",
    },
    body: [],
  };
  if (title in helmet) {
    results.headers.push(`<title>${helmet[title]}</title>`);
  }
  for (const opts of heads) {
    if (helmet[opts]) {
      helmet[opts].map((item) => {
        let tag = Object.keys(item)
          .map((t) => {
            return `${t}="${item[t]}"`;
          })
          .join(" ");
        results.headers.push(`<${opts} ${tag} />`);
      });
    }
  }
  results.attributes.body = helmet.bodyAttributes || "";
  results.attributes.html = helmet.htmlAttributes || "";
  for (const opts of body) {
    if (helmet[opts]) {
      helmet[opts].map((item) => {
        let tag = Object.keys(item)
          .map((t) => {
            if (t !== "innerText") {
              return `${t}="${item[t]}"`;
            }
          })
          .join(" ");
        results.body.push(`<${opts} ${tag}>${item.innerText || ""}</${opts}>`);
      });
    }
  }
  return results;
};

export const compileHTML = async (
  file: string,
  codes: { html: string; css: string; ids: string[] },
  assetsRoots: {
    js: string;
    css: string;
  },
  helmets: HelmetType,
  c: {
    root: RettleConfigInterface<any>["root"];
    pathPrefix: RettleConfigInterface<any>["pathPrefix"];
    js: RettleConfigInterface<any>["js"];
    css: RettleConfigInterface<any>["css"];
    template: RettleConfigInterface<any>["template"];
    version: RettleConfigInterface<any>["version"];
    header: RettleConfigInterface<any>["header"];
    outDir: RettleConfigInterface<any>["outDir"];
    esbuild: RettleConfigInterface<any>["esbuild"];
    build: RettleConfigInterface<any>["build"];
  },
  options: {
    dynamic?: string;
    noDir?: boolean;
    module?: boolean;
  } = {}
) => {
  try {
    let style = "";
    console.log(helmets);
    const helmet = createHelmet(helmets);
    console.log("helmet: ", helmet);
    const headers = createHeaders(c.version, c.header).concat(helmet.headers);
    const script = path.join(assetsRoots.js, c.js);
    headers.push(
      `<link rel="stylesheet" href="${path.join(assetsRoots.css, c.css)}">`
    );
    const markup = c.template({
      html: codes.html,
      headers,
      script,
      helmet: helmet.attributes,
      noScript: helmet.body,
      isModule: options.module || false,
    });
    style = style + codes.css;
    const exName = path.extname(file);
    let htmlOutputPath = path
      .join(c.outDir, c.pathPrefix, file.replace(c.root, ""))
      .replace(exName, ".html");
    if (options.dynamic) {
      const pattern = /\[(.*?)\]/;
      const result = htmlOutputPath.match(pattern);
      htmlOutputPath = result
        ? htmlOutputPath.replace(`[${result[1]}]`, options.dynamic)
        : htmlOutputPath;
    }
    if (!options.noDir) {
      await mkdirp(htmlOutputPath);
    }
    const minifyHtml = await minify(markup, {
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      preserveLineBreaks: true,
    });
    const code = c.build.buildHTML!(minifyHtml, htmlOutputPath);
    return Promise.resolve({ code, htmlOutputPath, style });
  } catch (e) {
    return Promise.reject(e);
  }
};
