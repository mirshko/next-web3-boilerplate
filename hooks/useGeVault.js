import { useState, useEffect } from "react";
import ADDRESSES from "../constants/RoeAddresses.json";
import { useWeb3React } from "@web3-react/core";
import GEVAULT_ABI from "../contracts/GeVault.json";
import ERC20_ABI from "../contracts/ERC20.json";
import useContract from "./useContract";
import { ethers } from "ethers";
import useGoodStats from "./useGoodStats";

var statsPeriod = "7d";

export default function useGeVault(vault, gevault) {
  if (!vault) vault = {name: ""}
  if (!gevault) gevault = {}
  const [tvl, setTvl] = useState(0);
  const [maxTvl, setMaxTvl] = useState(0);
  const [fee0, setFee0] = useState(0);
  const [fee1, setFee1] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [userValue, setUserValue] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const { account } = useWeb3React();
  const address = gevault.address;
  const gevaultContract = useContract(address, GEVAULT_ABI);
  const tpContract = useContract(address, ERC20_ABI);
  const goodStats = useGoodStats();

  const feesRate = goodStats && goodStats[statsPeriod][address] ? parseFloat(goodStats[statsPeriod][address].feesRate) : 0;
  const supplyRate = goodStats && goodStats[statsPeriod][address] ? parseFloat(goodStats[statsPeriod][address].supplyRate) : 0;
  const airdropRate = goodStats && goodStats[statsPeriod] ? parseFloat(goodStats[statsPeriod].airdropRate) : 0;

  const tvl2 = goodStats && goodStats[statsPeriod][address] ? parseFloat(goodStats[statsPeriod][address].tvl) / 1e8 : 0;
  const maxTvl2 = goodStats && goodStats[statsPeriod][address] ? parseFloat(goodStats[statsPeriod][address].maxTvl || 0) / 1e8 : 0;
  const totalRate = feesRate + supplyRate + (gevault.status == "Rewards" ? airdropRate : 0);

  var data = {
    address: address,
    name: gevault.name,
    tvl: tvl2,
    maxTvl: maxTvl,
    totalSupply: totalSupply,
    fee0: fee0,
    fee1: fee1,
    feeApr: feesRate,
    supplyApr: supplyRate,
    airdropApr: airdropRate,
    totalApr: totalRate,
    wallet: userBalance,
    walletValue: userValue,
    contract: gevaultContract,
    status: gevault.status,
    icon: "/icons/" + vault.name.toLowerCase() + ".svg",
  }
  
  useEffect( () => {
    const getData = async () => {
      try {
        console.log(gevaultContract.address, gevaultContract)
        let tS = await tpContract.totalSupply()
        console.log('--0', tS)
        let tSupply = ethers.utils.formatUnits(tS, 18);
        setTotalSupply(tSupply);
        console.log("--1", tSupply)
        let tTvl = await gevaultContract.getTVL();
        console.log('--15', tTvl)
        let tValue = ethers.utils.formatUnits(tTvl, 8);
        setTvl(tValue);
        console.log("--2", tValue)
        let uBal = ethers.utils.formatUnits(await gevaultContract.balanceOf(account), 18)
        setUserBalance(uBal);
        setUserValue(tValue == 0 ? 0 : tValue * uBal / tSupply);
        let tCap = ethers.utils.formatUnits(await gevaultContract.tvlCap(), 8).split('.')[0]
        console.log("--3", tCap)
        setMaxTvl(tCap);
        setFee0( (await gevaultContract.getAdjustedBaseFee(true) )/100 );
        setFee1( (await gevaultContract.getAdjustedBaseFee(false) )/100 );
      }
      catch(e){
        console.log("useGeVault", gevaultContract.address, e)
      }
    }
    
    if (address && gevaultContract) {
      console.log('getdata', address, gevaultContract)
      getData()
    }
  }, [address, vault.address, gevaultContract])

  return data;
}
