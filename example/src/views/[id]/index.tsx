import { createDynamicRoute, Component } from "rettle";
import { css } from "@emotion/react";
import { Helmet } from "react-helmet";
import { createClient } from "rettle/core";

const Hoge = (props: any) => {
  return (
    <Component.div frame={"[fr]"} css={css({ fontSize: "32px" })}>
      <Helmet>
        <meta charSet={"utf-8"} />
      </Helmet>
      {props.text}
    </Component.div>
  );
};

export default createDynamicRoute((id) => {
  const data = {
    hoge: {
      text: "Hello, World!",
    },
    fuga: {
      text: "How are you?",
    },
    piyo: {
      text: "ふわふわ",
    },
  } as { [index: string]: any };
  return data[id];
}, Hoge);

export const client = createClient(() => {
  console.log("Dynamic");
});

export const buildRequest = () => {
  return [];
};
