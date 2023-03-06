import { useState, useEffect } from 'react'
import { Button, Radio, Input, Divider, Spin, notification } from 'antd'
import useAssetData from '../../hooks/useAssetData'
import getUserLendingPoolData from '../../hooks/getUserLendingPoolData'
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import useOptionsPositionManager from "../../hooks/useOptionsPositionManager";
import useLendingPoolContract from "../../hooks/useLendingPoolContract";
import VaultPerpsStrikes from './vaultPerpsStrikes'
import PayoutChart from './payoutChart'
import {ethers} from 'ethers'
import { useWeb3React } from "@web3-react/core";

const VaultPerpsForm = ({vault, price, opmAddress}) => {
  const [assetInfo, setAssetData] = useState()
  const [strike, setStrike] = useState({})
  const [lowerStrike, setLowerStrike] = useState({})
  const [upperStrike, setUpperStrike] = useState({})
  const [direction, setDirection ] = useState('Long')
  const { account, chainId } = useWeb3React();
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const [isSpinning, setSpinning] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  
  const lpContract = useLendingPoolContract(vault.address)
  //const opm = useOptionsPositionManager(opmAddress)
  const userAccountData = getUserLendingPoolData(vault.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)

  const strikeAsset = useAssetData(strike.address)
  const { tokenAmounts, totalSupply } = useUnderlyingAmount(strike.address, vault)
  let tokenTraded = tokenAmounts.amount0 == 0 ? vault.token1.name : vault.token0.name  ;

  let maxOI = tokenAmounts.amount0 == 0 ? tokenAmounts.amount1 : tokenAmounts.amount0;

  const openPosition = async () => {
    if (inputValue == 0) return;
    setSpinning(true)
    try {
      let tickerAmount = (inputValue / (parseFloat(tokenAmounts.amount0) || parseFloat(tokenAmounts.amount1) ) * totalSupply).toFixed(0)  // whichever is non null
      console.log('tivdf', tickerAmount, tickerAmount.toString(), inputValue / (parseFloat(tokenAmounts.amount0) || parseFloat(tokenAmounts.amount1) ), totalSupply.toString())
      
      const abi = ethers.utils.defaultAbiCoder;
      let swapSource = ethers.constants.AddressZero;
      // if buying ITM, need to swap
      if ( (direction == "Long" && strike.price < price)  || (direction == "Short" && strike.price > price) ){
        swapSource = ( tokenAmounts.amount0 == 0 ? vault.token1.address : vault.token0.address )
      }
      
      let params = abi.encode(["uint8", "uint", "address", "address[]"], [0, vault.poolId, account, [swapSource] ]);
      // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
      console.log(opmAddress, [strike.address], [tickerAmount], [2], account, params, 0)
      let res = await lpContract.flashLoan(opmAddress, [strike.address], [tickerAmount], [2], account, params, 0)
      openNotification("success", "Tx Sent", "Tx mined")
    }
    catch(e){
      console.log('Error opening position', e.message)
      openNotification("error", e.code, e.message)
    }
    setSpinning(false)
  }
  
  useEffect(()=>{
    if (price == 0) return;
    for (let k of vault.ticks){
      if ( k.price < price){
        setLowerStrike({ price: k.price, address: k.address })
      }
      if ( k.price > price){
        setUpperStrike({ price: k.price, address: k.address });
        if (!strike.price) setStrike({ price: k.price, address: k.address })
        break;
      }
    }
  }, [JSON.stringify(vault), price, strike.price])
  
  return (
    <div>
      <Button type={ direction == 'Long' ? "primary" : "default"} style={{width: '50%', textAlign: 'center'}} 
        onClick={()=>{setDirection('Long')}}
      ><strong>Long</strong></Button>
      <Button type={ direction == 'Short' ? "primary" : "default"} style={{width: '50%', textAlign: 'center'}}
        onClick={()=>{setDirection('Short')}}>
        <strong>Short</strong></Button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          <div>
            Strike-In<span style={{ float: 'right'}}>Hourly Funding</span>
          </div>
          <div>
          { price > 0 ? <>
            { upperStrike.address ?
            <VaultPerpsStrikes key={upperStrike.address} address={upperStrike.address} vault={vault} onClick={setStrike} isSelected={strike.price==upperStrike.price} /> : null }
              { lowerStrike.address ? <VaultPerpsStrikes key={lowerStrike.address} address={lowerStrike.address} vault={vault} onClick={setStrike} isSelected={strike.price==lowerStrike.price} /> : null }
          </> : <Spin style={{ width: '100%', margin: '0 auto'}}/> }
         
          </div>
        <div style={{marginTop: 8}}>Max OI Available: <span style={{ float: 'right' }}>{parseFloat(maxOI).toFixed(5)} {tokenTraded}</span></div>
        <Input placeholder="Amount" suffix={tokenTraded} 
          onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
        />
        
        { isSpinning ?
          <Button type="default" style={{width: '100%'}} ><Spin /></Button>
          : <Button type="primary" onClick={openPosition} disabled={!strike.price || isSpinning}>{!strike.price ? 'Pick a Strike-In' : 'Open '+direction}</Button>
        }
        
        <PayoutChart direction={direction} strike={strike.price} price={price} step={upperStrike.price-lowerStrike.price} />
        
        <Divider />
        <span>Margin available: <span style={{ float: 'right'}}>${parseFloat(availableCollateral).toFixed(2)}</span></span>
        <Button href='/farm'>Add Margin</Button>
      </div>
    </div>
  )
  
}

export default VaultPerpsForm;