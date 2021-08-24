import type {
  ExternalProvider,
  JsonRpcFetchFunc,
} from "@ethersproject/providers";
import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import "../styles/globals.css";
function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
  return new Web3Provider(provider);
}

function NextWeb3App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default NextWeb3App;
