import { Web3ReactProvider } from "@web3-react/core";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from '../components/layout'
import getLibrary from "../getLibrary";
import { ConfigProvider, theme } from 'antd';

import "../styles/globals.css";

function NextWeb3App({ Component, pageProps }: AppProps) {
  
  const roetheme = {
      algorithm: theme.darkAlgorithm,
      token: {
        colorBgBase: '#222225',
        colorPrimary: '#FE4958', //;'#1666D3', 
        borderRadius: 2,
        fontSizeHeading1: 30,
        fontSizeHeading2: 20,
      },
    }
  console.log(roetheme);
  
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
