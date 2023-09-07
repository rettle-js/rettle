import { RettleConfigInterface } from "./utils/config";
import { default as emotionCreateCache, EmotionCache } from "@emotion/cache";
import ReactDom from "react-dom/server";
import createEmotionServer from "@emotion/server/create-instance";
import * as React from "react";
import { SerializedStyles } from "@emotion/react";
import { IntrinsicElements } from "./elementTypes";
import { CacheProvider } from "@emotion/react";

const defineOption = (options: () => Partial<RettleConfigInterface>) => {
  return options;
};

const createCache = (key: string) => emotionCreateCache({ key });

const createRettle = (
  element: JSX.Element,
  cache: EmotionCache = createCache("css")
) => {
  const html = React.createElement(CacheProvider, { value: cache }, element);
  const { extractCritical } = createEmotionServer(cache);
  return extractCritical(ReactDom.renderToString(html));
};

const createDynamicRoute = (
  routing: (id: string) => object,
  Application: React.FC<any>,
  cache: EmotionCache = createCache("css")
) => {
  return (id: string) => {
    const html = React.createElement(
      CacheProvider,
      { value: cache },
      React.createElement(Application, { ...routing(id) })
    );
    const { extractCritical } = createEmotionServer(cache);
    return extractCritical(ReactDom.renderToString(html));
  };
};

/***********************/

/* Components Methods */
/***********************/

type RettleComponent = {
  frame: "[fr]";
  children: JSX.Element | React.ReactNode;
  css?: SerializedStyles;
  clientKey?: string;
};
const Component = new Proxy(
  {},
  {
    get: (_, key: keyof IntrinsicElements) => {
      return (props: Record<string, any>) => {
        const prop = Object.keys(props).reduce((objAcc: any, key: any) => {
          // 累積オブジェクトにキーを追加して、値を代入
          if (
            key !== "frame" &&
            key !== "css" &&
            key !== "children" &&
            key !== "clientKey"
          ) {
            objAcc[key] = props[key];
          }
          // 累積オブジェクトを更新
          return objAcc;
        }, {});
        const clientKey = props.clientKey
          ? {
              "data-client-key": props.clientKey,
            }
          : {};
        return React.createElement(
          key,
          Object.assign(prop, {
            "data-rettle-fr": props.frame,
            ...clientKey,
          }),
          props.children
        );
      };
    },
  }
) as {
  [key in keyof IntrinsicElements]: (
    props: RettleComponent & IntrinsicElements[key]
  ) => JSX.Element;
};

interface CommentOutProps {
  children?: React.ReactNode;
  begin?: string;
  end?: string;
}

const CommentOut: React.FC<CommentOutProps> = (props) => {
  return React.createElement(
    "span",
    {
      "comment-out-begin": props.begin || "none",
      "comment-out-end": props.end || "none",
      "data-comment-out": true,
    },
    props.children
  );
};

export {
  Component,
  CommentOut,
  createRettle,
  defineOption,
  createCache,
  createDynamicRoute,
};
