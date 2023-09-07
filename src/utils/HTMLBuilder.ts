import * as esBuild from "esbuild";
import vm from "vm";
import fs from "fs";
import * as path from "path";
import { config } from "./config";
import { version } from "./variable";
import Helmet from "react-helmet";
import { parse } from "node-html-parser";
import js_beautify from "js-beautify";
import { mkdirp } from "./utility";
import { minify } from "html-minifier-terser";
import * as buffer from "buffer";

const { dependencies } = JSON.parse(
  fs.readFileSync(path.resolve("./package.json"), "utf-8")
);

const insertCommentOut = (code: string) => {
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
          config.beautify.html
            ? js_beautify.html(
                children,
                typeof config.beautify.html === "boolean"
                  ? {}
                  : config.beautify.html
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
  path: string
): Promise<{ html: string; ids: Array<string>; css: string }> => {
  return new Promise(async (resolve, reject) => {
    esBuild
      .build({
        bundle: true,
        entryPoints: [path],
        platform: "node",
        write: false,
        external: Object.keys(dependencies),
        plugins: config.esbuild.plugins!("server"),
        define: {
          "process.env": JSON.stringify(config.define),
        },
      })
      .then((res) => {
        try {
          const code = res.outputFiles![0].text;
          const context = {
            exports,
            module,
            process,
            require,
            __filename,
            __dirname,
            Buffer: buffer.Buffer,
          };
          vm.runInNewContext(code, context);
          const result = context.module.exports.default as {
            html: string;
            ids: Array<string>;
            css: string;
          };
          const HTML = insertCommentOut(result.html);
          if (process.env.NODE_ENV !== "server" && config.beautify.html) {
            result.html =
              typeof config.beautify.html === "boolean"
                ? js_beautify.html(HTML, {})
                : js_beautify.html(HTML, config.beautify.html);
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
  id: string
): Promise<{ html: string; ids: Array<string>; css: string }> => {
  return new Promise(async (resolve, reject) => {
    esBuild
      .build({
        bundle: true,
        entryPoints: [path],
        platform: "node",
        write: false,
        external: Object.keys(dependencies),
        plugins: config.esbuild.plugins!("server"),
        define: {
          "process.env": JSON.stringify(config.define),
        },
      })
      .then((res) => {
        try {
          const code = res.outputFiles![0].text;
          const context = {
            exports,
            module,
            process,
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
          const HTML = insertCommentOut(result.html);
          if (process.env.NODE_ENV !== "server" && config.beautify.html) {
            result.html =
              typeof config.beautify.html === "boolean"
                ? js_beautify.html(HTML, {})
                : js_beautify.html(HTML, config.beautify.html);
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

export const createHeaders = () => {
  const versionMeta = config.version
    ? [`<meta name="generator" content="Rettle ${version}">`]
    : [""];
  const headerMeta = config.header
    ? config.header.meta
      ? createHeaderTags("meta", config.header.meta)
      : [""]
    : [""];
  const headerLink = config.header?.link
    ? createHeaderTags("link", config.header?.link)
    : [""];
  const headerScript = config.header?.script
    ? createHeaderTags("script", config.header?.script)
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
export const createHelmet = () => {
  const helmet = Helmet.renderStatic();
  const heads = ["title", "base", "link", "meta", "script", "style"] as const;
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
  for (const opts of heads) {
    const opt = opts as (typeof heads)[number];
    if (helmet[opt]) {
      results.headers.push(helmet[opt].toString());
    }
  }
  results.attributes.body = helmet.bodyAttributes.toString() || "";
  results.attributes.html = helmet.htmlAttributes.toString() || "";
  for (const opts of body) {
    const opt = opts as (typeof heads)[number];
    if (helmet[opt]) {
      results.body.push(helmet[opt].toString());
    }
  }
  return results;
};

export const compileHTML = async (
  key: string,
  file: string,
  codes: { html: string; css: string; ids: string[] },
  dynamic?: string
) => {
  try {
    let style = "";
    const helmet = createHelmet();
    const headers = createHeaders().concat(helmet.headers);
    const root = key.replace(config.root, config.pathPrefix);
    const script = path.join("/", root, config.js);
    headers.push(
      `<link rel="stylesheet" href="${path.join("/", root, config.css)}">`
    );
    const markup = config.template({
      html: codes.html,
      headers,
      script,
      helmet: helmet.attributes,
      noScript: helmet.body,
    });
    style = style + codes.css;
    const exName = path.extname(file);
    let htmlOutputPath = path
      .join(config.outDir, config.pathPrefix, file.replace(config.root, ""))
      .replace(exName, ".html");
    if (dynamic) {
      const pattern = /\[(.*?)\]/;
      const result = htmlOutputPath.match(pattern);
      htmlOutputPath = result
        ? htmlOutputPath.replace(`[${result[1]}]`, dynamic)
        : htmlOutputPath;
    }
    await mkdirp(htmlOutputPath);
    const minifyHtml = await minify(markup, {
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      preserveLineBreaks: true,
    });
    const code = config.build.buildHTML!(minifyHtml, htmlOutputPath);
    return Promise.resolve({ code, htmlOutputPath, style });
  } catch (e) {
    return Promise.reject(e);
  }
};
