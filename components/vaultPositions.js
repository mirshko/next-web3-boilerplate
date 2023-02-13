import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Checkbox, Button } from 'antd';
import useAddresses from '../hooks/useAddresses';
import getUserLendingPoolData from '../hooks/getUserLendingPoolData';
import VaultPositionsRow from "./vaultPositionsRow"
import {ethers} from 'ethers'


/**
  Displays user positions in a vault
  That includes:
    - single assets
    - LPv2 positions (whether supply or debt)
    - Rangers (supply or debt)
*/
const VaultPositions = ({vault}) => {
  const [ assets, setAssets ] = useState([])
  const [ hideEmpty, setHideEmpty ] = useState(false);
  const { chainId } = useWeb3React();
  const ADDRESSES = useAddresses();
  const onChange = (e) => { setHideEmpty(!hideEmpty); };
  
  // Vault-level data
  const userAccountData = getUserLendingPoolData(vault.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)
  var totalDebt = ethers.utils.formatUnits(userAccountData.totalDebtETH ?? 0, 8)

  const columns = [
    { key: 'asset', title: 'Position', dataIndex: 'name' },
    { key: 'deposited', title: 'Balance', dataIndex: 'deposited' },
    { key: 'debt', title: 'Debt', dataIndex: 'debt' },
    { key: 'pnl', title: 'PnL', dataIndex: 'pnl' },
    { key: "action", dataIndex: "action", title: "Action" }
  ]
  
  var assetsList = [
    vault.token0.address,
    vault.token1.address,
    vault.lpToken.address,
  ]
  for (let r of vault.ranges) assetsList.push(r['address'])
  for (let r of vault.ticks) assetsList.push(r['address'])
  
  return (<div style={{width: '100%'}}>
    <Typography.Title level={2}>Vault {vault.name}</Typography.Title>
    <Typography.Text>
      Assets: ${availableCollateral} - Debt: ${totalDebt} - Health Factor: {healthFactor > 100 ? <>&infin;</> : parseFloat(healthFactor).toFixed(3)}
      <Checkbox style={{ float: 'right', marginBottom: 4 }} defaultChecked={hideEmpty}  onChange={onChange}>Hide empty positions</Checkbox>
    </Typography.Text>
    <Card style={{borderWidth: 0}} bodyStyle={{padding: 0}}>
      <table>
        <thead>
          <tr><th> </th><th style={{textAlign: 'left'}} colSpan={3}>Crab Strategies</th><th style={{textAlign: 'left'}} colSpan={3}>MOVE Strategies</th></tr>
          <tr>
            <th style={{textAlign: 'left'}}>Asset</th>
            <th style={{textAlign: 'left'}}>Balance</th>
            <th style={{textAlign: 'left'}}>APR</th>
            <th style={{textAlign: 'left'}}>Actions</th>
            <th style={{textAlign: 'left'}}>Debt</th><th>Debt APR</th>
            <th style={{textAlign: 'left'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {
          assetsList.map((assetAddress)=> <VaultPositionsRow assetAddress={assetAddress} vault={vault} hideEmpty={hideEmpty} key={assetAddress} />)
        }
        </tbody>
      </table>
    </Card>  
  </div>)
}

export default VaultPositions;