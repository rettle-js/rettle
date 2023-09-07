import { defineOption } from "rettle";
export default defineOption(() => {
  return {
    pathPrefix: "prefix/",
    outDir: "dist",
    beautify: {
      css: true,
    },
    build: {},
    dynamicRoutes: {
      "./src/views/[id]/index.tsx": async () => {
        return ["hoge", "fuga", "piyo"];
      },
      "./src/views/result_[id]/index.tsx": async () => {
        return ["hoge", "fuga", "piyo"];
      },
    },
    header: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "shortcut icon", href: "/favicon.ico" }],
    },
  };
});
