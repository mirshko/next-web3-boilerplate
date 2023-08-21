import { useEffect, useState } from "react";
import axios from "axios";


const useLeaderboard = () => {
  const [data, setdata] = useState({});
  
  useEffect(() => {
    const getData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/leaderboard7d.json?timestamp="+(new Date().getTime())
        var dataraw = (await axios.get(url)).data;
        setdata(dataraw)
      }
      catch(e) {
        console.log("Leaderboard", e)
      }
    }
    getData();
  }, []);
  return data;
}

export default useLeaderboard;