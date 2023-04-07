import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import axios from "axios";


const useGoodStats = () => {
  const ADDRESSES = useAddresses();
  const [data, setdata] = useState({apr: 0});
  
  useEffect(() => {
    const getData = async () => {
      try {
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/stats.json"
        var dataraw = await axios.get(url)
        var stats = dataraw.data.data
        setdata(stats)
      }
      catch(e) {
        console.log("GoodStats data", e)
      }
    }
    getData();
  }, []);

  return data;
}

export default useGoodStats;