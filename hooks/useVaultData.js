import ADDRESSES from "../constants/RoeAddresses.json";
import { useWeb3React } from "@web3-react/core";

export default function useVaultData(activeChainOnly) {
  const { chainId } = useWeb3React();
  var vaults = [];
  for (let chain in ADDRESSES) {
    if (!activeChainOnly || chain == chainId)
      for (let lp in ADDRESSES[chain].lendingPools) {
        vaults.push({
          key: vaults.length,
          network: ADDRESSES[chain].network,
          ...ADDRESSES[chain].lendingPools[lp],
        });
      }
  }

  return vaults;
}
