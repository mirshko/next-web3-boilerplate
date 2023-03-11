import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Checkbox, Button, Tooltip } from 'antd';
const { Column, ColumnGroup } = Table;
import useAddresses from '../hooks/useAddresses';
import useAssetData from '../hooks/useAssetData';
import DepositWithdrawalModal from "./depositWithdrawalModal"
import DepositWithdrawalTickerModal from "./depositWithdrawalTickerModal"
import CloseDebt from './closeDebt';
import CloseTrPositionButton from './closeTrPositionButton'
import {ethers} from 'ethers'

/**
  Displays user positions in a vault
  That includes:
    - single assets
    - LPv2 positions (whether supply or debt)
    - Rangers (supply or debt)
*/
const VaultPositionsRow = ({assetAddress, vault, hideEmpty}) => {
  const [ assets, setAssets ] = useState([])
  const ADDRESSES = useAddresses();
  const asset = useAssetData(assetAddress, vault.address)

  if (hideEmpty && asset.deposited == 0 && asset.debt == 0  ) return (<></>);
  const columns = [
    { key: 'asset', title: 'Position', dataIndex: 'name' },
    { key: 'deposited', title: 'Balance', dataIndex: 'deposited' },
    { key: 'debt', title: 'Debt', dataIndex: 'debt' },
    { key: 'pnl', title: 'PnL', dataIndex: 'pnl' },
    { key: "action", dataIndex: "action", title: "Action" }
  ]
  
  if (asset.type == 'single') asset.depositedAction = <DepositWithdrawalModal asset={asset} size="small" lendingPool={vault} />
  else if (asset.type == 'lpv2') {
    asset.depositedAction = <>
        <Button size="small" type="primary" href={'/ranger/'+vault.address}>Farm {vault.name}</Button>&nbsp;
        <CloseDebt asset={asset} type='closeV2' vault={vault} />
      </>
    asset.debtAction = <>
        <Button type="primary" size="small" href={'/cds?vault='+vault.address+'&asset='+asset.address}>Buy CDS</Button>&nbsp;
        <CloseDebt asset={asset} type="closeV2longg"  vault={vault} />
      </>
  }
  else if (asset.type == 'ranger'){
    asset.depositedAction = <>
        <Button size="small" type="primary" href={'/ranger/'+vault.address}>Farm {vault.name}</Button>&nbsp;
        <CloseDebt asset={asset} type='closeRange' vault={vault} />
      </>
    asset.debtAction = <>
        <CloseTrPositionButton address={assetAddress} vault={vault} opmAddress={ADDRESSES['optionsPositionManager']} />
      </>
  }
  else if (asset.type == 'ticker'){
    asset.depositedAction = <DepositWithdrawalTickerModal asset={asset} size="small" vault={vault} opmAddress={ADDRESSES['optionsPositionManager']} />
    asset.debtAction = <>
        <Button size="small" type="primary" href={'/protectedperps/'}>Protected Perps</Button>&nbsp;
        <CloseTrPositionButton address={assetAddress} vault={vault} opmAddress={ADDRESSES['optionsPositionManager']} />
      </>
  }

  return (
    <Col md={6} xs={24} style={{ marginBottom: 24}}>
    <Card onClick={()=>{}} bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <img src={asset.icon} height={24} alt={asset.name.toLowerCase()} />
        <span style={{ fontSize: 'large', fontWeight: 'bold', marginLeft: 8 }}>{asset.name}</span>
        <br/>      <br/>
      </div>
      <Tooltip placement="right" title={<>
          ROE APR: {asset.supplyApr}%<br/>
          { asset.feeApr > 0 ? <>v3 APR: {asset.feeApr}%</> : null }
        </>}>
        <div style={{ width: '100%', backgroundColor: '#444', display: 'flex', justifyContent: 'center', padding: 8, marginTop: 8, marginBottom: 8}}>
          <span style={{
            textDecoration: 'underline #ccc dotted', fontSize: 'large'
          }}>
            APR {(parseFloat(asset.supplyApr) + parseFloat(asset.feeApr)).toFixed(2)} %
          </span>
        </div>
      </Tooltip>
  
      <Row style={{ width: '100%', marginBottom: 24}}>
        <Col span={12}>
          <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>TVL</span>
          <br/>
          {asset.deposited == 0 ? <>0</> : parseFloat(asset.deposited).toFixed(6)}
        </Col>
        <Col span={12}>
          <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>My Assets</span>
          <br/>
          {asset.deposited == 0 ? <>0</> : parseFloat(asset.deposited).toFixed(6)}
        </Col>
      </Row>


      <>{asset.depositedAction}</>
      </Card>
  </Col>)
  
}

export default VaultPositionsRow;