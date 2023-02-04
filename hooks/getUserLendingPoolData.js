import useLendingPoolContract from "./useLendingPoolContract";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useState, useEffect } from "react"

/// Get an array with all data related to a symbol, eg USDC or ETH, including user balances and pool balance
export default function getUserLendingPoolData(pool) {
  const [userData, setUserData ] = useState()
  const { account } = useWeb3React();
  const lendingPool = useLendingPoolContract(pool);


  const getData = async () => {
    try {
      if(!lendingPool) return;
      var data = await lendingPool.getUserAccountData(account)
      setUserData(data);
    } catch(e){console.log('err getUserAcountData',e)}
  }

  useEffect(() => {
    getData()
  }, [lendingPool])
  
  
  return userData;
}