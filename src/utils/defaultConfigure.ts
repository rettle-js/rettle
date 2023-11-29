import { RettleConfigInterface } from "./config";
import { templateHtml } from "./template.html";
import * as process from "process";
import RettlePlugin from "esbuild-plugin-rettle";

const config: RettleConfigInterface = {
  pathPrefix: "/",
  outDir: "./htdocs",
  static: "./static",
  css: "/assets/style/app.css",
  js: "/assets/script/app.js",
  beautify: {},
  template: templateHtml,
  root: "src/views/",
  endpoints: ["/"],
  build: {
    buildHTML: (code) => code,
    buildCss: (code) => code,
    buildScript: () => {},
    copyStatic: () => {},
  },
  esbuild: {
    plugins: (mode) => {
      return [
        RettlePlugin({
          filter: /./,
          mode: mode,
          babel: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                  importSource: "@emotion/react",
                },
              ],
            ],
            plugins: [
              [
                "@emotion/babel-plugin",
                {
                  labelFormat: "[filename]_[local]",
                },
              ],
            ],
          },
        }),
      ];
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  define: {},
  version: true,
};

export const defaultConfig = config;
