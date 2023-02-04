import { useState } from "react";
import { Card, Typography, Table, Divider, Row, Col, Button, Tooltip } from "antd";
import { DownOutlined, UpOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import LendingPoolTable from "./lendingPoolTable";

const VaultCard = ({vault}) => {
  const [isVaultOpen, setOpen] = useState(false);
  const toggleOpen = () => { setOpen(!isVaultOpen) }
  const assetNames = vault.vault.split('-');
  const asset0 = vault.assets.asset0;
  const asset1 = vault.assets.asset1;

  
  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: "space-between", margin: '-24px', padding: 24, cursor: 'pointer'}} onClick={toggleOpen}>
        <div style={{width: 40}}>
          {isVaultOpen ? <DownOutlined  style={{ fontSize: '12px', color: '#08c' }}/> : <UpOutlined  style={{ fontSize: '12px', color: '#08c' }}/> }
        </div>
        <div style={{width: 300, display: 'flex', alignItems: 'center'}}>
          <img src={"/icons/"+assetNames[0].toLowerCase()+".svg"} width={24} height={24} alt="token0" />
          <img src={"/icons/"+assetNames[1].toLowerCase()+".svg"} width={24} height={24} alt="token1" />&nbsp;
          {vault.vault}
        </div>
        <div style={{width: 300, display: 'flex', alignItems: 'center'}}>
          <img src={"/icons/"+vault.network.toLowerCase()+".svg"} width={24} height={24} alt="network" />&nbsp;{vault.network}
        </div>
        <div style={{width: 300}}>{'TLV: $' + vault.tlv+'k'}</div>
        <div style={{width: 100 }}>My: ${vault.tlv}</div>
      </div>
      
      <div style={{ display: (isVaultOpen ? 'block' : 'none') }}>
        <Divider />
        <Row gutter={16} type="flex">
          <Col span={12}>
            <Card title={<>
              Single Asset Yield&nbsp;<Tooltip placement="right" title="Stable performance in any type of market"><QuestionCircleOutlined /></Tooltip>
            </>}
              >
              <LendingPoolTable assets={[asset0, asset1]} isMinimal={true} lendingPool={vault} />  
            </Card>
          </Col>
          <Col span={12} type="flex">
            <Card style={{ marginBottom: 16 }} 
              title={<>
                Crab Strategies&nbsp;
                <Tooltip placement="right" title="Outperforming yield in ranged markets"><QuestionCircleOutlined /></Tooltip>
              </>} >
              <Row justify="space-between">
                <Col span={10} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <strong>Full Range Strategy</strong><br/>
                   7% APR (1x)<br/>
                   <Typography.Text type="success" strong >60% APR (10x)</Typography.Text>
                   <Button disabled style={{ marginTop: 16 }}>Farm LPv2</Button>
                </Col>
                <Col type="flex">
                  <Divider type="vertical" style={{ height: "100%" }} />
                </Col>
                <Col span={10} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <strong>V3 Range Strategy</strong><br/>
                   40% APR (1x)<br/>
                   <Typography.Text type="success" strong >300% APR (10x)</Typography.Text>
                   <Button  style={{ marginTop: 16 }} type="primary" href={'/ranger/'+vault.address}>Farm LPv3</Button>
                </Col>
              </Row>
            </Card>
            <Card style={{  }} title={<>
                MOVE Strategies&nbsp;
                <Tooltip placement="right" title="Outperforming in trending markets"><QuestionCircleOutlined /></Tooltip>
              </>}>
              LongG v2 v3
              ...
            </Card>
          </Col>
        </Row>
      </div>
    </Card>
  )
}

export default VaultCard;
