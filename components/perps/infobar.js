import { useState, useEffect } from 'react'
import { Dropdown, Button, Card } from 'antd'
import axios from 'axios'
import VaultsDropdown from '../vaultsDropdown'

const Infobar = ({vaults, current, selectVault, price }) => {
  let [dailyCandle, setDailyCandle] = useState({})
  let [isDropdownVisible, setDropdownvisible ] = useState(false)
  let currentVault = vaults[current];
  let ohlcUrl = currentVault.ohlcUrl

  useEffect( () => {
    // get candles from geckoterminal
    async function getData() {
      try {
        let apiUrl = ohlcUrl + '1d'
        const data = await axios.get(apiUrl, {withCredentials: false,})
        let candles = []
        let dailyCandle = data.data[data.data.length-1]
        // push price up to main page
        setDailyCandle(dailyCandle)
      } catch(e) {console.log(e)}
    }
    const intervalId = setInterval(() => {
      if (ohlcUrl) getData();
    }, 5000);
    return () => { clearInterval(intervalId); };
  }, [ohlcUrl])

let change = dailyCandle[1] - dailyCandle[4]
let changePercent = 100 * (dailyCandle[1] - dailyCandle[4]) / ( dailyCandle[1] || 1 )

  let red = '#e57673' 
  let green = '#55d17c'
  
  return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 40 }}>
    <VaultsDropdown selectVault={selectVault} vaults={vaults} currentVault={currentVault} />
    
    <span style={{ fontSize: 'larger' }}>{price}</span>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Change</span>
      <span style={{ fontSize: 'smaller', color: change > 0 ? green:red }}>{change.toFixed(2)} {change>0?'+':'-'}{changePercent.toFixed(2)}%</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h High</span>
      <span style={{ fontSize: 'smaller'}}>{parseFloat(dailyCandle[2]??0).toFixed(2)}</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Low</span>
      <span style={{ fontSize: 'smaller'}}>{parseFloat(dailyCandle[3]??0).toFixed(2)}</span>
    </div>
    
  </div>)
  
  
}


export default Infobar;