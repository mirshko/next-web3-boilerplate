// components/layout.js
import { useWeb3React } from "@web3-react/core";
import { TwitterOutlined, MediumOutlined, GithubOutlined } from "@ant-design/icons";
import Account from "./Account";

import NavChain from "./navChain";
import useEagerConnect from "../../hooks/useEagerConnect";

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

const NavRight = () => {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
      <a
        href="https://gitbook.goodentry.io/"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        Docs
      </a>
      <a
        href="https://crew3.xyz/c/goodentrylabs/questboard"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        Quests
      </a>
      <a
        href="https://discord.com/invite/goodentry"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        <img alt="discord" src="/images/discord-white.svg" height={13} />
      </a>
      <a
        href="https://twitter.com/goodentrylabs"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        <TwitterOutlined style={{ fontSize: "larger" }} />
      </a>
      <a
        href="https://goodentrylabs.medium.com/"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        <MediumOutlined style={{ fontSize: "larger"}} />
      </a>
      <a
        href="https://github.com/GoodEntry-io/GoodEntryMarkets"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        <GithubOutlined style={{ fontSize: "larger"}} />
      </a>
      <NavChain />
      <Account triedToEagerConnect={triedToEagerConnect} />
    </div>
  );
};

export default NavRight;
