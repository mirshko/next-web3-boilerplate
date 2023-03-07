import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import axios from 'axios';

// will replace url of binance by token address and should get uniswap data
const useCandles = (url) => {
  const [candles, setCandles] = useState([]);
  
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await axios.get(url, {withCredentials: false,})
        const candleData = data.data.result.list.reverse() // Bybit format, reverse order
        let can = []
        for (let c of candleData) can.push({time: c[0]/1000, open: c[1], high: c[2], low: c[3], close: c[4]})
        setCandles(can)
      } catch(e) {
        console.log('Loading candles ', e)
      }
    }
    
    
    const intervalId = setInterval(() => {
      if (url) getData();
    }, 5000);
    return () => { clearInterval(intervalId); };
  }, [url]);

  return candles;
}

export default useCandles;