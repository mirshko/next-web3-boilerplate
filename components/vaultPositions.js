import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Checkbox, Button } from 'antd';
import useAddresses from '../hooks/useAddresses';
import getUserLendingPoolData from '../hooks/getUserLendingPoolData';
import VaultPositionsBox from "./vaultPositionsBox"
import {ethers} from 'ethers'
import axios from "axios"


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
  const [ oorVisible, setOorVisible ] = useState(false)
  const [ price, setPrice] = useState(0)
  const { chainId } = useWeb3React();
  const ADDRESSES = useAddresses();
  const onChange = (e) => { setHideEmpty(!hideEmpty); };
  
  // Vault-level data
  const userAccountData = getUserLendingPoolData(vault.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)
  var totalCollateral = ethers.utils.formatUnits(userAccountData.totalCollateralETH ?? 0, 8)
  var totalDebt = ethers.utils.formatUnits(userAccountData.totalDebtETH ?? 0, 8)

  const columns = [
    { key: 'asset', title: 'Position', dataIndex: 'name' },
    { key: 'deposited', title: 'Balance', dataIndex: 'deposited' },
    { key: 'debt', title: 'Debt', dataIndex: 'debt' },
    { key: 'pnl', title: 'PnL', dataIndex: 'pnl' },
    { key: "action", dataIndex: "action", title: "Action" }
  ]
  
  useEffect( () => {
    const getPrice = async () => {
      try {
        var tokenName = vault.name.split('-')[0]
        if (tokenName == 'WETH') tokenName = 'ETH'
        // binance US doesnt have GMX
        //const url = "https://api.binance.us/api/v3/ticker/price?symbol="+tokenName+"USDT"
        //setPrice(parseFloat(data.data.price))
        
        // https://bybit-exchange.github.io/docs/v5/market/index-kline
        const url = "https://api.bybit.com/v5/market/index-price-kline?category=linear&interval=D&limit=1&symbol="+tokenName+"USDT"
        const data = await axios.get(url)
        const result = data.data.result
        setPrice(result.list[0][4])
      }
      catch(e){console.log('getPrice error', e)}
    }
    getPrice()
  }, [])
  
  var assetsList = [
    vault.token0.address,
    vault.token1.address,
    //vault.lpToken.address,
  ]
  //for (let r of vault.ranges) assetsList.push(r['address'])
  for (let r of vault.ticks) {
    // TODO: better definition
    let step = (vault.name == 'WETH-USDC') ? 100 : 5 // 100 step for weth, 5 step for gmx
    if ( oorVisible || price == 0 || Math.abs(price - parseFloat(r.price)) < step ) assetsList.push(r['address'])
  }
  
  var orderedList = []

  return (<div style={{width: '100%'}}>
    <Typography.Title level={2}>Vault {vault.name}</Typography.Title>
    <Typography.Text>
      Assets: ${parseFloat(totalCollateral).toFixed(2)} - Debt: ${parseFloat(totalDebt).toFixed(2)} - Health Factor: {healthFactor > 100 ? <>&infin;</> : parseFloat(healthFactor).toFixed(3)}
      <Checkbox style={{ float: 'right', marginBottom: 4, marginRight: 24 }} defaultChecked={oorVisible}  onChange={()=>{setOorVisible(!oorVisible)}}>Show Out of Range Vaults</Checkbox>
      <Checkbox style={{ float: 'right', marginBottom: 4, marginRight: 24 }} defaultChecked={hideEmpty}  onChange={onChange}>Hide empty positions</Checkbox>
    </Typography.Text>
    
    <Row gutter={24} style={{ width: '100%', marginTop: 12}}>
      {
        assetsList.map((assetAddress)=> <VaultPositionsBox assetAddress={assetAddress} vault={vault} hideEmpty={hideEmpty} key={assetAddress} />)
      }
    </Row>
  </div>)
}

export default VaultPositions;