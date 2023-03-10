import { Web3ReactProvider } from "@web3-react/core";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ConfigProvider, theme } from "antd";

import Layout from "../components/layout";
import getLibrary from "../getLibrary";
import { useLogRocketInit } from "../hooks/useLogRocketInit";

import "../styles/globals.css";

function NextWeb3App({ Component, pageProps }: AppProps) {
  useLogRocketInit();

  const roetheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgBase: "#222225",
      colorPrimary: "#55D17C", //"#FE4958", //;'#1666D3',
      colorBgContainer: `rgb(54, 54, 58, 0.3)`,
      borderRadius: 2,
      fontSizeHeading1: 30,
      fontSizeHeading2: 20,
    },
  };

  return (
    <ConfigProvider theme={roetheme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Web3ReactProvider>
    </ConfigProvider>
  );
}

export default NextWeb3App;
