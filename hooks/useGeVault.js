import { useState, useEffect } from "react";
import ADDRESSES from "../constants/RoeAddresses.json";
import { useWeb3React } from "@web3-react/core";
import GEVAULT_ABI from "../contracts/GeVault.json";
import useContract from "./useContract";
import { ethers } from "ethers";


export default function useGeVault(vault) {
  const [tvl, setTvl] = useState(0);
  const [maxTvl, setMaxTvl] = useState(0);
  const [fee0, setFee0] = useState(0);
  const [fee1, setFee1] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const { account } = useWeb3React();
  const gevaultContract = useContract(vault.geVault, GEVAULT_ABI);

  var data = {
    address: vault.geVault,
    tvl: tvl,
    maxTvl: maxTvl,
    totalSupply: totalSupply,
    fee0: fee0,
    fee1: fee1,
    feeApr: 0,
    borrowApr: 0,
    totalApr: 0,
    wallet: userBalance,
    contract: gevaultContract,
  }
  
  useEffect( () => {
    const getData = async () => {
      try {
        setTotalSupply(ethers.utils.formatUnits(await gevaultContract.totalSupply(), 18) );
        setTvl( ethers.utils.formatUnits(await gevaultContract.getTVL(), 8) );
        setUserBalance(ethers.utils.formatUnits(await gevaultContract.balanceOf(account), 18));
        setMaxTvl(ethers.utils.formatUnits(await gevaultContract.tvlCap(), 8));
        setFee0( (await gevaultContract.getAdjustedBaseFee(true) )/100 );
        setFee1( (await gevaultContract.getAdjustedBaseFee(false) )/100 );
      }
      catch(e){
        console.log("useGeVault", e)
      }
    }
    
    if (gevaultContract) getData()
  }, [vault.address, gevaultContract])

  return data;
}
