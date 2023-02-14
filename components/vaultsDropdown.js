import { Button, Card, theme } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { useToken } = theme;

export default function VaultsDropdown({vaults, selectVault, currentVault}){
  const { token } = useToken();
  
  
  return (
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
    )
  
}