import { useEffect, useState } from "react";
import axios from "axios";

// Calculate 7d HVOL
const useTokenHVol = (ohlcUrl) => {
  const [hvol, setVol] = useState(10);
  
  useEffect(() => {
    const getData = async () => {
      try {
        var dataraw = await axios.get(ohlcUrl+"D")
        
        if (dataraw) {
          console.log(dataraw)
          const candles = dataraw.data.result.list; // candles are already from recent to old
          
          // calc hvol on 7d: 
          let sum_dev = 0
          for(let k = 0; k<7; k++)
            sum_dev += Math.pow(Math.log(parseFloat(candles[k][4])) - parseFloat(Math.log(candles[k+1][4])), 2)
          let rvol = Math.sqrt(365/7*sum_dev) 
          setVol(rvol)
        }
      }
      catch(e) {
        console.log("HVol data", e)
      }
    }
    if (ohlcUrl) getData();
  }, [ohlcUrl]);
  return hvol;
}

export default useTokenHVol;