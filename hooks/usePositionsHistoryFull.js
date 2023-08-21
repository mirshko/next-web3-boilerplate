import { useEffect, useState } from "react";
import axios from "axios";


const usePositionsHistoryFull = () => {
  const [data, setData] = useState({});
  
  useEffect(() => {
    const getData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      //console.log('Check positions')
      try {
        const url = "https://roe.nicodeva.xyz/stats/arbitrum/getx.json?timestamp="+(new Date().getTime())
        var dataraw = (await axios.get(url)).data;
        var allTx = []
        for (let k of Object.keys(dataraw)){
          allTx = allTx.concat(dataraw[k].tx)
        }
        // sort
        allTx.sort( (a,b) => (a['date'] < b['date']) ? 1 : -1)
        setData(allTx)
      }
      catch(e) {
        console.log("PositionsHistory data", e)
      }
    }
    getData();
  }, []);
  return data;
}

export default usePositionsHistoryFull;