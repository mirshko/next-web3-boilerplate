import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";


const useRangeStats = (tokenId) => {
  const ADDRESSES = useAddresses();
  //const url = "https://staging-api.revert.finance/v1/positions/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId
  const url = "https://api.roe.finance/revert/"+ADDRESSES['network'].toLowerCase()+"/uniswapv3/"+tokenId+"_"+(new Date().getUTCHours())
  const [data, setdata] = useState({});
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");
  
  useEffect(() => {
    if (!tokenId) return;
    console.log('sdfsd', url)
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        seterror(data.error)
        setdata(data.data)
        setloading(false)
      })
  }, [tokenId]);

  return data;
}


export default useRangeStats;