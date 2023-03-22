import useLendingPoolContract from "./useLendingPoolContract";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useState, useEffect } from "react"

/// Get an array with all data related to a symbol, eg USDC or ETH, including user balances and vault balance
export default function getUserLendingPoolData(vault) {
  const [userData, setUserData ] = useState({})
  const { account } = useWeb3React();
  const lendingPool = useLendingPoolContract(vault);


  const getData = async () => {
    try {
      if(!lendingPool || !account) return;
      var data = await lendingPool.getUserAccountData(account)
      setUserData(data);
    } catch(e){console.log('err getUserAcountData', account, e)}
  }

  useEffect(() => {
    getData()
  }, [lendingPool, account])
  
  
  return userData;
}