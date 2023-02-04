import { useState } from 'react'
import { Dropdown, Button, Card, theme } from 'antd'
import { DownOutlined } from '@ant-design/icons';
const { useToken } = theme;

const Infobar = ({vaults, current, selectVault, price, change24, low24, high24}) => {
  const { token } = useToken();
  let [isDropdownVisible, setDropdownvisible ] = useState(false)
  let currentVault = vaults[current];
  
  let vaultsNames = vaults.map( (v, index) => { return {key: index, label: v.name} } )
  let change = change24 ?? "0 0.00%"

  
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
    
    <span style={{ fontSize: 'larger' }}>{price}</span>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Change</span>
      <span style={{ fontSize: 'smaller', color: change.substring(0, 1) == '-' ? '#e57673' : '#55d17c' }}>82 +5.21%</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h High</span>
      <span style={{ fontSize: 'smaller' }}>82 +5.21%</span>
    </div> 
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <span style={{ fontSize: 'x-small', color: 'grey' }}>24h Low</span>
      <span style={{ fontSize: 'smaller' }}>82 +5.21%</span>
    </div>
    
  </div>)
  
  
}


export default Infobar;