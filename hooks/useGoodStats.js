import { useEffect, useState } from "react";
import axios from "axios";


const useGoodStats = () => {
  const empty = {apr: 0}
  const [data, setdata] = useState({"7d": empty, "24h": empty });
  
  useEffect(() => {
    const getData = async () => {
      try {
        const url7 = "https://roe.nicodeva.xyz/stats/arbitrum/stats7d.json"
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/stats.json"
        var dataraw7 = await axios.get(url7)
        var dataraw = await axios.get(url)

        var stats = dataraw.data
        setdata({ "24h": dataraw.data, "7d": dataraw7.data})
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