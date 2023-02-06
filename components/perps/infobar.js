import { useState, useEffect } from 'react'
import { Dropdown, Button, Card, theme } from 'antd'
import { DownOutlined } from '@ant-design/icons';
import axios from 'axios'
const { useToken } = theme;

const Infobar = ({vaults, current, selectVault }) => {
  const { token } = useToken();
  let [dailyCandle, setDailyCandle] = useState({})
  let [isDropdownVisible, setDropdownvisible ] = useState(false)
  let currentVault = vaults[current];

  useEffect( () => {
    // get candles from geckoterminal
    async function getdata() {
      try {
        let apiUrl = currentVault.ohlcUrl + '1d'
        const data = await axios.get(apiUrl, {withCredentials: false,})
        let candles = []
        let dailyCandle = data.data[data.data.length-1]
        // push price up to main page
        setDailyCandle(dailyCandle)
      } catch(e) {console.log(e)}
    }
    getdata()
  }, [currentVault])

let change = dailyCandle[1] - dailyCandle[4]
let changePercent = 100 * (dailyCandle[1] - dailyCandle[4]) / ( dailyCandle[1] || 1 )

  let red = '#e57673' 
  let green = '#55d17c'
  
  return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 40 }}>
    <div className="dropdownPerp">
      <Button type="text" style={{ padding: '0px 0px 0 16px'}}><span style={{ fontWeight: 'bold', fontSize: 'large'}}>{currentVault.name}</span> <DownOutlined /></Button>
      <Card className="dropdownPerp-content" bodyStyle={{ backgroundColor: token.colorBgContainer, padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        {
          vaults.map( (v, index) => <Button key={v.name} style={{ textAlign: 'left'}} type="text" onClick={()=>selectVault(index)}>{v.name}</Button> )
        }
        </div>
      </Card>
    </div>
    
    <span style={{ fontSize: 'larger' }}>{dailyCandle[4]}</span>
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