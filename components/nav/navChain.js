import React from "react";
import { Button } from "antd";
import { useSetChain } from "@web3-onboard/react";

const NavChain = () => {
  const [
    {
      connectedChain
    },
  ] = useSetChain() ?? {};

  const chainId = Number(connectedChain?.id);

  const onClick = async ({ key }) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + parseInt(key).toString(16) }],
      });
    } catch (e) {
      console.log("Switch chain", e);
    }
  };

  if (!chainId) return <></>;

  const items = [
    {
      key: "42161",
      label: "Arbitrum",
      icon: (
        <img
          src="/icons/arbitrum.svg"
          height={16}
          width={16}
          alt="Arbitrum Logo"
        />
      ),
    },
    /*{
      key: '137',
      label: "Polygon",
      icon: <img src="/icons/polygon.svg" height={16} width={16} />
    },
    {
      key: '1',
      label: "Ethereum",
      icon: <img src="/icons/ethereum.svg" height={16} width={16} />
    },
    {
      key: '1337',
      label: "Arbitrum-Fork",
      icon: <img src="/icons/polygon.svg" height={16} width={16} />
    },*/
  ];

  let label = {};
  for (let k of items) if (k.key == chainId) label = k;

  return (
    <Button
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginRight: -1,
      }}
      icon={label.icon}
      onClick={()=>{onClick({key: "42161"})}}
    >
      {label.label ? label.label : "Wrong Network"}
    </Button>
  );
};

export default NavChain;
