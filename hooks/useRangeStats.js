import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import axios from "axios";


const useRangeStats = (tokenId) => {
  const ADDRESSES = useAddresses();
  //const url = "https://staging-api.revert.finance/v1/positions/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId
  
  const [data, setdata] = useState({apr: 0});
  
  useEffect(() => {
    const getData = async () => {
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

        setdata({apr: apr})
      }
      catch(e) {
        console.log("APR data", e)
      }
    }
    if (tokenId) getData();
  }, [tokenId]);

  return data;
}


export default useRangeStats;