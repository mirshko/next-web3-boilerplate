import { useState, useEffect } from 'react'
import { Dropdown, Button, Card } from 'antd'
import axios from 'axios'
import VaultsDropdown from '../vaultsDropdown'
import getUserLendingPoolData from '../../hooks/getUserLendingPoolData'
import {ethers} from 'ethers'

const Infobar = ({vaults, current, selectVault, price }) => {
  let [dailyCandle, setDailyCandle] = useState({})
  let [isDropdownVisible, setDropdownvisible ] = useState(false)
  let currentVault = vaults[current];
  let ohlcUrl = currentVault.ohlcUrl
  
  const userAccountData = getUserLendingPoolData(currentVault.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)
  var totalCollateral = ethers.utils.formatUnits(userAccountData.totalCollateralETH ?? 0, 8)
  var totalDebt = ethers.utils.formatUnits(userAccountData.totalDebtETH ?? 0, 8)

  useEffect( () => {
    // get candles from geckoterminal
    async function getData() {
      try {
        let apiUrl = ohlcUrl + 'D&limit=1'
        const data = await axios.get(apiUrl, {withCredentials: false,})
        let candles = []
        // bybit format
        let dailyCandle = data.data.result.list[0]
        // push price up to main page
        setDailyCandle(dailyCandle)
      } catch(e) {console.log(e)}
    }
    const intervalId = setInterval(() => {
      if (ohlcUrl) getData();
    }, 5000);
    return () => { clearInterval(intervalId); };
  }, [ohlcUrl])

  let change = parseFloat(dailyCandle[1]) - parseFloat(dailyCandle[4])
  let changePercent = 100 * change / ( parseFloat(dailyCandle[1]) || 1 )
  let marginUsage = (totalCollateral> 0 ? 100 * parseFloat(totalDebt).toFixed(2) / parseFloat(totalCollateral) / 0.94 : 0 )

  let red = '#e57673' 
  let green = '#55d17c'
  
  return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 40 }}>
    <VaultsDropdown selectVault={selectVault} vaults={vaults} currentVault={currentVault} />
    
    <span style={{ fontSize: 'larger' }}>{price}</span>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Change</span>
      <span style={{ fontSize: 'smaller', color: change > 0 ? green:red }}>{change.toFixed(2)} {changePercent.toFixed(2)}%</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h High</span>
      <span style={{ fontSize: 'smaller'}}>{parseFloat(dailyCandle[2]??0).toFixed(2)}</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Low</span>
      <span style={{ fontSize: 'smaller'}}>{parseFloat(dailyCandle[3]??0).toFixed(2)}</span>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>Avail. Margin</span>
      <span style={{ fontSize: 'smaller'}}>$ {10*parseFloat(availableCollateral).toFixed(2)}</span>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>Margin Usage</span>
      <span style={{ fontSize: 'smaller', color: (marginUsage > 80 ? 'yellow' : 'rgba(255,255,255,085)')}}>{(marginUsage).toFixed(2)}%</span>
    </div>
  </div>)
  
  
}


export default Infobar;