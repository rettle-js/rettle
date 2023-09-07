import { RettleConfigInterface } from "./config";

export interface templateHTMLInterface
  extends Pick<RettleConfigInterface, "header"> {
  html: string;
  headers: Array<string>;
  script: string;
  style?: string;
  helmet: {
    html: string;
    body: string;
  };
  noScript: string[];
  mode?: "server" | "build";
}

export const templateHtml = (options: templateHTMLInterface) => {
  return `
<!DOCTYPE html>
<html ${options.helmet.html}>
<head>
${options.headers.join("\n")}
${options.style ? options.style : ""}
</head>
<body ${options.helmet.body}>
${options.noScript ? options.noScript.join("\n") : ""}
${options.html}
<script src="${options.script}" ${
    options.mode === "server" ? 'type="module"' : ""
  }></script>
</body>
</html>
  `;
};
