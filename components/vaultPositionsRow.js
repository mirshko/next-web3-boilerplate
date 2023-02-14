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

  return (<>
    <tr>
      <td>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={asset.icon} height={24} alt={asset.name.toLowerCase()} />&nbsp;
          {asset.name}
        </div>
      </td>
      <td>{asset.deposited == 0 ? <>0</> : parseFloat(asset.deposited).toFixed(6)}</td>
      <td>
        <Tooltip placement="right" title={<>
          ROE APR: {asset.supplyApr}%<br/>
          Fees APR: {asset.feeApr}%
        </>}>
          <span style={{textDecoration: 'underline #ccc dotted' }}>{(parseFloat(asset.supplyApr) + parseFloat(asset.feeApr)).toFixed(2)} %</span>
        </Tooltip>
      </td>
      <td>{asset.depositedAction}</td>
      <td>{asset.debt == 0 ? <>0</> : parseFloat(asset.debt).toFixed(6)}</td>
      <td>{asset.debtApr} %</td>
      <td>{asset.debtAction}</td>
  </tr></>)
  
}

export default VaultPositionsRow;