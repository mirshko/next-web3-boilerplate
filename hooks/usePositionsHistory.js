import { useEffect, useState } from "react";
import axios from "axios";


const usePositionsHistory = (account) => {
  const [data, setdata] = useState();
  
  useEffect(() => {
    const getData = async () => {
      try {
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/getx.json"
        var dataraw = (await axios.get(url)).data;

        setdata(dataraw[account])
      }
      catch(e) {
        console.log("PositionsHistory data", e)
      }
    }
    getData();
  }, [account]);
  return data;
}

export default usePositionsHistory;