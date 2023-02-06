import ADDRESSES from "../contracts/RoeAddresses.json";
import { useWeb3React } from "@web3-react/core";
export default function useVaultData(activeChainOnly) {
  const { chainId } = useWeb3React();
  
  var vaults = []
  for ( let chain in ADDRESSES ) { 
    if (!activeChainOnly || chain == chainId)
    for ( let lp in ADDRESSES[chain].lendingPools){
      vaults.push({
        key: vaults.length,
        network: ADDRESSES[chain].network,
        ...ADDRESSES[chain].lendingPools[lp]
      })
    }
  }
  /* const LENDING_POOL = "0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1"
  vaults = [
    { key: 0, network: 'Ethereum', vault: "ETH-USDC", assets: {asset0: eth, asset1: usdc}, tlv: 15.6, lpAddress: LENDING_POOL },
    { key: 1, network: 'Polygon', vault: "ETH-USDC", assets: {asset0: eth, asset1: usdc}, tlv: 16.6, lpAddress: LENDING_POOL  },
    { key: 2, network: 'Arbitrum', vault: "ETH-USDC", assets: {asset0: eth, asset1: usdc}, tlv: 45.6, lpAddress: LENDING_POOL  },
    { key: 3, network: 'Ethereum', vault: "FXS-FRAX", assets: {asset0: eth, asset1: usdc}, tlv: 15.6, lpAddress: LENDING_POOL  },
    { key: 4, network: 'Ethereum', vault: "wBTC-USDC", assets: {asset0: eth, asset1: usdc}, tlv: 35.6, lpAddress: LENDING_POOL  },
    { key: 5, network: 'Ethereum', vault: "ETH-USDC", assets: {asset0: eth, asset1: usdc}, tlv: 15.6, lpAddress: LENDING_POOL  },
  ];*/
  
  
  return vaults;
  
}