import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from 'axios'; 

const REWARDS_URL = "https://roe.nicodeva.xyz/stats/arbitrum/total_rewards.json";

export default function useRewards() {
  const { account } = useWeb3React();
  const [rewards, setRewards] = useState({})
  
  useEffect(()=>{
    const getData = async () => {
      try {
        const rdata = (await axios.get(REWARDS_URL)).data;
        let rew = {
          good_per_round: 17361 // 5% of 1B supply as airdrop, so 50M / 120d / 24 rounds  = 17361 / round
        }
        if (rdata.rounds) rew.rounds = rdata.rounds;
        if (rdata.points) {
          rew.points = rdata.points;
          rew.distributed = parseFloat(rdata.points) * rew.good_per_round;
        }
        if (rdata.hasOwnProperty(account)){
          rew = {
            ...rew, 
            user_points: rdata[account].points,
            user_good: parseFloat(rdata[account].points) * rew.good_per_round,
            totalDebt: rdata[account].totalDebt,
            totalGev: rdata[account].totalGev,
          }
        }
        setRewards(rew)
      }
      catch(e) {
        console.log("Get Rewards", e);
      }
    }
    getData()
  }, [account])
  
  return rewards;
}
