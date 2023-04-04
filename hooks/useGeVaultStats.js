import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import axios from "axios";


const useGeVaultStats = (vault) => {
  const ADDRESSES = useAddresses();
  //const url = "https://staging-api.revert.finance/v1/positions/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId
  
  const [data, setdata] = useState({apr: 0});
  
  
  useEffect(() => {
    const getTickData = async (tokenId) => {
      try {
        const url0 = "https://api.roe.finance/revert/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId+"_"+(new Date().getUTCHours())
        const url1 = "https://api.roe.finance/revert/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId+"_"+((new Date().getUTCHours() + 23) % 24)
        
        var data0raw = await axios.get(url0)
        var data1raw = await axios.get(url1)
        
        var data0 = data0raw.data.data
        var data1 = data1raw.data.data
        
        // 23h earned fees
        var fees0 = data1.total_fees0 - data0.total_fees0
        var fees1 = data1.total_fees1 - data0.total_fees1

        // earned: value of fees
        var earned = fees0 * parseFloat(data1.tokens[data1.token0].price) + fees1 * parseFloat(data1.tokens[data1.token1].price)
        var apr = 100 * earned / data0.underlying_value * 365 / (data1.age - data0.age)

        return {apr: apr, earned: earned, uvalue: data0.underlying_value, age: data1.age - data0.age }
      }
      catch(e) {
        console.log("APR data", e)
      }
    }
    
    const getData = async () => {
      var earned = 0
      var tvl = 0
      var age = 0
      for(let p of vault.ticks){
        var yd = await getTickData(p.tokenId)
        tvl += parseFloat(yd.uvalue)
        earned += parseFloat(yd.earned)
        age += parseFloat(yd.age)
      }
      // avg APR 24h, use avg of the positions ages too in case not flat
      setdata({ apr: 100 * earned / tvl * 365 / age * vault.ticks.length });
    }
    
    if (vault) getData();
  }, [vault]);

  return data;
}


export default useGeVaultStats;