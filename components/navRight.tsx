// components/layout.js
import { useWeb3React } from "@web3-react/core";
import { Menu } from "antd"
import { TwitterOutlined } from '@ant-design/icons';
import Link from "next/link";
import Account from "../components/Account";

import ETHBalance from "./ETHBalance";
//import TokenBalance from "./TokenBalance";
import NavChain from "./navChain";
import useEagerConnect from "../hooks/useEagerConnect";

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

const NavRight = () =>  {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div style={{ display: 'flex', alignItems: 'center'}}>
      <a href='https://twitter.com/goodentrylabs' target="_blank" style={{marginRight: 24}}><TwitterOutlined /></a>
      {isConnected && (
        <>
        {/*<ETHBalance />*/}

          {/*<TokenBalance tokenAddress={DAI_TOKEN_ADDRESS} symbol="DAI" />*/}
        </>
      )}
      <NavChain />
      <Account triedToEagerConnect={triedToEagerConnect} />
    </div>
  )
}


export default NavRight;