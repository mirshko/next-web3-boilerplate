import React from 'react';
import { useWeb3React } from "@web3-react/core";
import { Dropdown, Button } from 'antd';
import { ethers } from "ethers";

const NavChain = () => {
  const { chainId } = useWeb3React();
  
  const onClick = async ({ key }) => {
    try {
      await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x'+parseInt(key).toString(16) }]
        });
    }
    catch(e){console.log('Switch chain', e)}
  }
  
  
  const items = [
    {
      key: '42161',
      label: "Arbitrum",
      icon: <img src="/icons/arbitrum.svg" height={16} width={16} />
    },
    {
      key: '137',
      label: "Polygon",
      icon: <img src="/icons/polygon.svg" height={16} width={16} />
    },
    /*{
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
  for (let k of items)
    if (k.key == chainId ) label = k
  
  return(<>
  <Dropdown menu={{ items, onClick }}>
    <a onClick={(e) => e.preventDefault()}>
      <Button style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 24}}
        icon={label.icon}
      >
        {label.label ? label.label : 'Wrong Network'}
      </Button>
    </a>
  </Dropdown>
  </>)
  
}


export default NavChain;