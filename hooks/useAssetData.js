import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import useTokenBalance from "./useTokenBalance"
import useTokenContract from "./useTokenContract"
import useLendingPoolContract from "./useLendingPoolContract"
import useContract from "./useContract"
import ERC20_ABI from "../contracts/ERC20.json";
import { ethers } from "ethers";

/// Get an array with all data related to a symbol, eg USDC or ETH, including user balances and pool balance
/// @param address if a string, use that asset, if object, iterates over as a list of addresses
export default function useAssetData(address, vaultAddress) {
  const { account } = useWeb3React()
  const [roeSupply, setRoeSupply] = useState()
  const [ debt, setDebt ] = useState(0)
  const [variableRate, setVariableRate] = useState(0)
  const [supplyRate, setSupplyRate] = useState(0)
  const ADDRESSES = useAddresses(vaultAddress)
  let lp = ADDRESSES['lendingPools'][0];

  var asset;

  // will fail with Error: Rendered more hooks than during the previous render. if the asset address isnt found here, since it would skip some hooks
  if (address == lp['token0'].address) asset = {type: 'single', ...lp.token0}
  else if (address == lp['token1'].address) asset = {type: 'single', ...lp.token1}
  else if (address == lp['lpToken'].address) asset = {type: 'lpv2', ...lp.lpToken}
  else {
    // loop on ranges
    for ( let k of lp.ranges )
      if ( address == k.address ) asset = {type: 'ranger', name: 'Range-'+k.price, ...k}
    // loop on ticks
    
    for ( let k of lp.ticks )
      if ( address == k.address ) asset = {type: 'ticker', name: 'Tick-'+k.price, ...k}
  }

  asset = { 
    apr: supplyRate, 
    debtApr: variableRate,
    wallet: 0, deposited: 0, tlv: 0, 
    debt: debt ,
    ...asset
  }
  asset.tlv = roeSupply;
  if (asset.name) asset.icon = "/icons/"+asset.name.split(/[\ -]/)[0].toLowerCase()+".svg";
  else asset.icon ="/favicon.ico";


  // get token supply = TLV
  const roeToken = useTokenContract(asset.roeAddress);
  const getRoeSupply = async () => {
    try {
      var data = await roeToken.totalSupply()
      setRoeSupply( ethers.utils.formatUnits(data, asset.decimals) )
    } catch(e){console.error}
  }
  getRoeSupply()
  
  // get user debt . Somehow I need to use the useContract because other hooks fail weirdly?
  const debtContract = useContract(asset.debtAddress, ERC20_ABI);
  const getDebtAmount = async () => {
    if (!asset.debtAddress || !debtContract) return;
    try {
      var data = await debtContract.totalSupply()
      setDebt(ethers.utils.formatUnits(data, asset.decimals))
    } catch(e) { console.log('Get debt error', e)}
  }  
  getDebtAmount()
  
  // Get variable debt/supply rates
  const lpContract = useLendingPoolContract(lp.address)
  const getVariableRate = async () => {
    if ( !lpContract) return;
    try {
      var data = await lpContract.getReserveData(asset.address)
      setVariableRate( (data.currentVariableBorrowRate / 1e25).toFixed(2) )      
      setSupplyRate( (data.currentLiquidityRate / 1e25).toFixed(2) )      
    } catch(e){console.log('Get variable rate', e)}
  }
  getVariableRate()

  
  if (asset.roeAddress) {
    const { data } = useTokenBalance(account, asset.roeAddress)
    asset.deposited = ethers.utils.formatUnits(data ?? 0, asset.decimals) ?? 0
  } 
  
  {
    const { data } = useTokenBalance(account, asset.address)
    asset.wallet =  ethers.utils.formatUnits(data ?? 0, asset.decimals) ?? 0
  }
  
  return asset;
}