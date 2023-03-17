// components/layout.js
import { useWeb3React } from "@web3-react/core";
import { TwitterOutlined, MediumOutlined } from "@ant-design/icons";
import Account from "./Account";

import NavChain from "./navChain";
import useEagerConnect from "../../hooks/useEagerConnect";

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

const NavRight = () => {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <a
        href="https://goodentry.io/academy"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24, color: "#bbbbbb" }}
      >
        Academy
      </a>
      <a
        href="https://crew3.xyz/c/goodentrylabs/questboard"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24, color: "#bbbbbb" }}
      >
        Quests
      </a>
      <a
        href="https://discord.gg/7rCQCZV9YR"
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
        <TwitterOutlined style={{ fontSize: "larger", color: "#bbbbbb" }} />
      </a>
      <a
        href="https://goodentrylabs.medium.com/"
        target="_blank"
        rel="noreferrer"
        style={{ marginRight: 24 }}
      >
        <MediumOutlined style={{ fontSize: "larger", color: "#bbbbbb" }} />
      </a>
      <NavChain />
      <Account triedToEagerConnect={triedToEagerConnect} />
    </div>
  );
};

export default NavRight;
