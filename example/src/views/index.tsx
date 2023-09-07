import * as React from "react";
import { createCache, createRettle, Component } from "rettle";
import { css, Global } from "@emotion/react";
import Button from "@/Component/Button";
import Helmet from "react-helmet";
import { createClient, watcher, useReactive } from "rettle/core";

const cache = createCache("rettle");

const App = () => {
  const global = css({
    html: {
      backgroundColor: "#20232a",
      color: "white",
    },
    body: {
      margin: "0",
    },
    img: {
      display: "block",
      width: "100%",
    },
  });

  const wrap = css({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "100vh",
  });

  const head = css({
    textAlign: "center",
  });

  const logo = css({
    width: "400px",
    marginRight: "auto",
    marginLeft: "auto",
  });

  const counterWrap = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "500px",
    marginRight: "auto",
    marginLeft: "auto",
  });

  const button = css({
    width: "100px",
    height: "30px",
    marginTop: "20px",
  });

  return (
    <Component.div frame={"[fr]"} css={wrap}>
      <Global styles={global} />
      <Helmet title={"Rettle App"} />
      <div css={logo}>
        <img src={"/rettle-logo.svg"} alt={"rettle logo"} />
      </div>
      <h1 css={head}>Hello, Rettle App!</h1>
      <div css={counterWrap}>
        <div>
          Counter: <span rettle-ref={"counter"} />
        </div>
        <div css={button}>
          <Button>Count UP</Button>
        </div>
      </div>
    </Component.div>
  );
};

export const client = createClient(({ getRef }) => {
  const counterNode = getRef("counter");
  const count = useReactive(0);
  watcher(
    () => {
      counterNode.innerText = `${count.value}`;
    },
    [count],
    true
  );
  counterNode.innerText = `${count.value}`;
  const handleCountUp = () => {
    count.value++;
  };
  return {
    button: {
      handleCountUp,
    },
  };
});
export default createRettle(App(), cache);
