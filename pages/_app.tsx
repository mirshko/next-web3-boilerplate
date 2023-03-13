import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";

import Layout from "../components/layout";
import getLibrary from "../getLibrary";
import { useLogRocketInit } from "../hooks/useLogRocketInit";
import { appColorScheme } from "../constants/appColorScheme";

import "../styles/globals.css";

function NextWeb3App({ Component, pageProps }: AppProps) {
  useLogRocketInit();

  return (
    <ConfigProvider theme={appColorScheme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Web3ReactProvider>
    </ConfigProvider>
  );
}

export default NextWeb3App;
