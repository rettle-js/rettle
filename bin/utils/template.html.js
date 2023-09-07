"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateHtml = void 0;
const templateHtml = (options) => {
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
<script src="${options.script}" ${options.mode === "server" ? 'type="module"' : ""}></script>
</body>
</html>
  `;
};
exports.templateHtml = templateHtml;
//# sourceMappingURL=template.html.js.map