import { Button, Dropdown } from "antd";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../connectors";
import useENSName from "../../hooks/useENSName";
import { formatEtherscanLink, shortenHex } from "../../util";
import { useConnectWallet } from "@web3-onboard/react";;

type AccountProps = {
  triedToEagerConnect: boolean;
};

const Account = ({ triedToEagerConnect }: AccountProps) => {
  const { activate } = useWeb3React();
  const [{ wallet, connecting }, connect, disconnect ] = useConnectWallet();
  const { accounts, chains } = wallet ?? {};

  const [account] = accounts ?? [];
  const [chain] = chains ?? [];

  const { address } = account ?? {};
  const chainId = Number(chain?.id);

  const ENSName = useENSName(address);

  const shortenAccount = ENSName || `${shortenHex(address ?? "", 4)}`;

  const connectWallet = async () => {
    try {
      const [connected] = await connect();
      if (connected) {
        await activate(injected, undefined, true);
      }
    } catch (e) {
      console.info(e);
    }
  }

  const items = [
    {
      key: "account",
      label: (
        <a
          href={formatEtherscanLink("Account", [chainId, address])}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          Account &rarr;
        </a>
      ),
    },
    { key: "disconnect", label: "Disconnect" },
  ];

  const onAccountButtonClick = ({ key }) => {
    switch (key) {
      case "disconnect":
        disconnect(wallet);
    }
  };

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof address !== "string") {
    return (
      <div>
        <Button
            disabled={connecting}
            onClick={() => connectWallet()}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <Dropdown menu={{ items, onClick: onAccountButtonClick }}>
      <Button>{shortenAccount}</Button>
    </Dropdown>
  );
};

export default Account;
