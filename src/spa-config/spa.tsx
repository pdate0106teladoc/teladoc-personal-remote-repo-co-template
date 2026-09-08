import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import App from "../App";
import { BrowserRouter } from "react-router-dom";

const lc = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: () => (
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorBoundary(err: any) {
    return <div>Error: {err?.message || String(err)}</div>;
  },
});

export const { bootstrap, mount, unmount } = lc;
