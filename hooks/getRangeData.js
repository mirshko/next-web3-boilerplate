import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import useTokenBalance from "./useTokenBalance"
import useTokenContract from "./useTokenContract"
import { ethers } from "ethers";

/// Get an array with all data related to a symbol, eg USDC or ETH, including user balances and pool balance
export default function getRangeData(address, pool) {
  if (!address) return {}
  const [roeBalance, setRoeBalance] = useState(0)
  const { account } = useWeb3React();
  const ADDRESSES = useAddresses(pool)
  const lp = ADDRESSES['lendingPools'][0]
  
  var asset = (() => {for (let r of lp["ranges"]) { if (r.address == address) return r;} })();

  if (asset && asset.roeAddress) {
    const { data } = useTokenBalance(account, asset.roeAddress)
    asset.deposited = ethers.utils.formatUnits(data ?? 0, asset.decimals) ?? 0
  }
  return asset;
}