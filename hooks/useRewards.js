import { useEffect, useState } from "react";
import axios from 'axios'; 

const REWARDS_URL = "https://roe.nicodeva.xyz/stats/arbitrum/total_rewards.json";

export default function useRewards(address) {
  const [rewards, setRewards] = useState({})
  
  useEffect(()=>{
    const getData = async () => {
      try {
        const rdata = (await axios.get(REWARDS_URL)).data;
        if (rdata.hasOwnProperty(address)){
          setRewards({
            rounds: rdata.rounds,
            totalDebt: rdata[address].totalDebt,
            totalGev: rdata[address].totalGev,
          })
        }
      }
      catch(e) {
        console.log("Get Rewards", e);
      }
    }
    getData()
  }, [address])
  
  return data;
}
