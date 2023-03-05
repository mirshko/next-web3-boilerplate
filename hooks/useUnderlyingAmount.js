import { useEffect, useState } from "react";
import useContract from "./useContract";
import usePriceOracle from './usePriceOracle';
import TR_ABI from "../contracts/TokenizableRange.json"
import UniswapV2Pair_ABI from "../contracts/UniswapV2Pair.json"
import { ethers } from "ethers";

export default function useUnderlyingAmount(rangeAddress, vault, isTotalUnderlying){
  // if (isTotalUnderlying): return all underlying, else return for 1e18
  const [tokenAmounts, setTokenAmounts] = useState({amount0: 0, amount1: 0})
  
  var type = 'v3';
  if ( vault['lpToken'] && vault['lpToken'].address == rangeAddress ) type = "v2"
  
  const ranger = useContract(rangeAddress, type=="v2" ? UniswapV2Pair_ABI : TR_ABI);
  const oracle = usePriceOracle()

  // Get the underlying token amounts for the Ranger
  useEffect( () => {
    const getTokenAmounts = async () => {
      if(!ranger) return;
      
      var tAmounts, data;
      var oracleValue = await oracle.getAssetPrice(rangeAddress)
      if (type=="v2"){
        let supplyRatio = isTotalUnderlying ? 1 : 1e18 / (await ranger.totalSupply()) 
        let res = await ranger.getReserves();
        data = { token0Amount: res[0] * supplyRatio, token1Amount: res[1] * supplyRatio }
      }
      else if (type == "v3" ){
        // changed from getTokenAmounts to getTokenAmountsExcludingFees to ignore potential non compounded fees
        data = await ranger.getTokenAmountsExcludingFees(isTotalUnderlying ? (await ranger.totalSupply()) : ethers.constants.WeiPerEther)
      }

      tAmounts = {
        amount0: data ? ethers.utils.formatUnits(data.token0Amount, vault.token0.decimals) : 0,
        amount1: data ? ethers.utils.formatUnits(data.token1Amount, vault.token1.decimals) : 0,
      }
      setTokenAmounts(tAmounts)
    }
    try {
      getTokenAmounts()
    } catch(e){console.log('getTokenAmounts', e)}
  }, [ranger])


  return tokenAmounts;
}