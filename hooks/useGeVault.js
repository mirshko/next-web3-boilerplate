import { useState, useEffect } from "react";
import ADDRESSES from "../constants/RoeAddresses.json";
import { useWeb3React } from "@web3-react/core";
import GEVAULT_ABI from "../contracts/GeVault.json";
import useContract from "./useContract";
import { ethers } from "ethers";
import useGeVaultStats from "./useGeVaultStats";


export default function useGeVault(vault) {
  const [tvl, setTvl] = useState(0);
  const [maxTvl, setMaxTvl] = useState(0);
  const [fee0, setFee0] = useState(0);
  const [fee1, setFee1] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [userValue, setUserValue] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const { account } = useWeb3React();
  const gevaultContract = useContract(vault.geVault, GEVAULT_ABI);
  const statsApr = useGeVaultStats(vault);
  const uniFees = statsApr ? parseFloat(statsApr.apr).toFixed(2) : 0;

  var data = {
    address: vault.geVault,
    name: vault.name,
    tvl: tvl,
    maxTvl: maxTvl,
    totalSupply: totalSupply,
    fee0: fee0,
    fee1: fee1,
    feeApr: uniFees,
    supplyApr: "0.00",
    totalApr: uniFees,
    wallet: userBalance,
    walletValue: userValue,
    contract: gevaultContract,
    icon: "/icons/" + vault.name.toLowerCase() + ".svg",
  }
  
  useEffect( () => {
    const getData = async () => {
      try {
        let tSupply = ethers.utils.formatUnits(await gevaultContract.totalSupply(), 18);
        setTotalSupply(tSupply);
        let tValue = ethers.utils.formatUnits(await gevaultContract.getTVL(), 8);
        setTvl(tValue);
        let uBal = ethers.utils.formatUnits(await gevaultContract.balanceOf(account), 18)
        setUserBalance(uBal);
        setUserValue(tValue == 0 ? 0 : tValue * uBal / tSupply);
        setMaxTvl(ethers.utils.formatUnits(await gevaultContract.tvlCap(), 8));
        setFee0( (await gevaultContract.getAdjustedBaseFee(true) )/100 );
        setFee1( (await gevaultContract.getAdjustedBaseFee(false) )/100 );
      }
      catch(e){
        console.log("useGeVault", e)
      }
    }
    
    if (vault.geVault && gevaultContract) getData()
  }, [vault.address, gevaultContract])

  return data;
}
