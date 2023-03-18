import { Button, Dropdown } from "antd";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";
import { injected } from "../../connectors";
import useENSName from "../../hooks/useENSName";
import useMetaMaskOnboarding from "../../hooks/useMetaMaskOnboarding";
import { formatEtherscanLink, shortenHex } from "../../util";

type AccountProps = {
  triedToEagerConnect: boolean;
};

const Account = ({ triedToEagerConnect }: AccountProps) => {
  const { active, error, activate, deactivate, chainId, account, setError } =
    useWeb3React();

  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding();

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  const ENSName = useENSName(account);

  const shortenAccount = ENSName || `${shortenHex(account ?? "", 4)}`;

  const items = [
    {
      key: "account",
      label: (
        <a
          href={formatEtherscanLink("Account", [chainId, account])}
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
        deactivate();
    }
  };

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    return (
      <div>
        {isWeb3Available ? (
          <Button
            disabled={connecting}
            onClick={() => {
              setConnecting(true);

              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
          >
            {isMetaMaskInstalled ? "Connect to MetaMask" : "Connect to Wallet"}
          </Button>
        ) : (
          <Button onClick={startOnboarding}>Install Metamask</Button>
        )}
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
