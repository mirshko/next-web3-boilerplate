import { useState, useEffect } from 'react'
import { Button, Radio, Input, Divider, Spin, notification } from 'antd'
import useAssetData from '../../hooks/useAssetData'
import getUserLendingPoolData from '../../hooks/getUserLendingPoolData'
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import useOptionsPositionManager from "../../hooks/useOptionsPositionManager";
import useLendingPoolContract from "../../hooks/useLendingPoolContract";
import VaultPerpsStrikes from './vaultPerpsStrikes'
import {ethers} from 'ethers'
import { useWeb3React } from "@web3-react/core";

const VaultPerpsForm = ({vault, price, opmAddress}) => {
  const [assetInfo, setAssetData] = useState()
  const [strike, setStrike] = useState({})
  const [direction, setDirection ] = useState('Long')
  const { account, chainId } = useWeb3React();
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const [isSpinning, setSpinning] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  
  const lpContract = useLendingPoolContract(vault.address)
  //const opm = useOptionsPositionManager(opmAddress)
  const userAccountData = getUserLendingPoolData(vault.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData ? userAccountData.healthFactor : 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData ? userAccountData.availableBorrowsETH : 0, 8)

  const tokenAmounts = useUnderlyingAmount(strike.address, vault)
  let tokenTraded = tokenAmounts.amount0 == 0 ? vault.token1.name : vault.token0.name  ;

  const openPosition = async () => {
    if (inputValue == 0) return;
    setSpinning(true)
    try {
      let tickerAmount = inputValue / (parseFloat(tokenAmounts.amount0) || parseFloat(tokenAmounts.amount1) )  // whichever is non null
      
      const abi = ethers.utils.defaultAbiCoder;
      let params = abi.encode(["uint8", "uint", "address", "address[]"], [0, vault.poolId, account, [ethers.constants.AddressZero] ]);
      // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
      //console.log(opmAddress, [strike.address], [ethers.utils.parseUnits(tickerAmount.toString(), 18)], [2], account, params, 0)
      let res = await lpContract.flashLoan(opmAddress, [strike.address], [ethers.utils.parseUnits(tickerAmount.toString(), 18)], [2], account, params, 0)
      openNotification("success", "Tx Sent", "Tx mined")
    }
    catch(e){
      console.log('Error opening position', e.message)
      openNotification("error", e.code, e.message)
    }
    setSpinning(false)
  }
  
  useEffect(()=>{
    for (let k of vault.ticks){
      if ( k.price > price){
        setStrike({ price: k.price, address: k.address });
        break;
      }
    }
  }, [vault])
    

  return (
    <div>
      <Button type={ direction == 'Long' ? "primary" : "default"} style={{width: '50%', textAlign: 'center'}} 
        onClick={()=>{setDirection('Long'); setStrike(0)}}
      ><strong>Long</strong></Button>
      <Button type={ direction == 'Short' ? "primary" : "default"} style={{width: '50%', textAlign: 'center'}}
        onClick={()=>{setDirection('Short'); setStrike(0)}}>
        <strong>Short</strong></Button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          <div>
            Strike-In<span style={{ float: 'right'}}>Hourly Funding</span>
          </div>
          <div>
            {vault.ticks.map( (tick) => {
                if ( ( direction == 'Long' && price < tick.price ) || ( direction == "Short" && price > tick.price ) )
                  return (<VaultPerpsStrikes key={tick.address} address={tick.address} vault={vault} onClick={setStrike} isSelected={tick.price == strike.price} />)
              })
            }
          </div>
        <Input placeholder="Amount" suffix={tokenTraded} 
          onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
        />
        
        { isSpinning ?
          <Button type="default" style={{width: '100%'}} ><Spin /></Button>
          : <Button type="primary" onClick={openPosition} disabled={!strike.price}>{!strike.price ? 'Pick a Strike-In' : 'Open '+direction}</Button>
        }
        <Divider />
        <span>Margin available: <span style={{ float: 'right'}}>${parseFloat(availableCollateral).toFixed(2)}</span></span>
        <Button disabled>Add Margin</Button>
      </div>
    </div>
  )
  
}

export default VaultPerpsForm;