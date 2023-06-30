import { Button, Card, theme } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { useToken } = theme;

export default function VaultsDropdown({vaults, selectVault, currentVault, size}){
  const { token } = useToken();
  
  return (
    <div className="dropdownPerp">
    <Button type="text" style={{ padding: "4px 0px 0px 0px"}} size={size?'large':'default'}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={"/icons/"+currentVault.name.toLowerCase()+".svg"} height={32} width={64} />
        <span style={{ fontWeight: 600, fontSize: size || 'large', color: 'white'}}>
        {currentVault.name}</span> <DownOutlined style={{ fontSize: size?"large":"default", marginLeft: 16}} />
      </div>
    </Button>
    <Card className="dropdownPerp-content" bodyStyle={{ backgroundColor: token.colorBgContainer, padding: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      {
        vaults.map( (v, index) => <Button key={v.name} style={{ textAlign: 'left', color: 'white'}} type="text" onClick={()=>selectVault(index)}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={"/icons/"+v.name.toLowerCase()+".svg"} height={24} width={48} />
            {v.name}
          </div>
        </Button> )
      }
      </div>
    </Card>
  </div>
    )
  
}