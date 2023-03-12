// pages/_document.tsx

import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ConfigProvider } from "antd";
import { extractStyle } from "@ant-design/static-style-extract";
import { appColorScheme } from "../constants/appColorScheme";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: React.Children.toArray([initialProps.styles])
    };
  }

  private antdCss = extractStyle((node) => (
      <ConfigProvider theme={appColorScheme}>
          {node}
      </ConfigProvider>
  ));

  render() {
    return (
      <Html lang="en">
        <Head>        
          <title>Good Entry</title>
          <link rel="icon" href="/favicon.ico" />
          <style>{this.antdCss}</style>
        </Head>
        <body style={{ backgroundColor: '#222225', margin: 0 }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
