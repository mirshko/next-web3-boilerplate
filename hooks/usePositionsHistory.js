import { useEffect, useState } from "react";
import axios from "axios";


const usePositionsHistory = (account, refresh) => {
  const [data, setdata] = useState({});
  
  useEffect(() => {
    const getData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      //console.log('Check positions')
      try {
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/getx.json"
        var dataraw = (await axios.get(url)).data;

        setdata(dataraw[account])
      }
      catch(e) {
        console.log("PositionsHistory data", e)
      }
    }
    if (account) getData();
  }, [account, refresh]);
  return data;
}

export default usePositionsHistory;