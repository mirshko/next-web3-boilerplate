import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import { Col, Row, Button, Card, Input, InputNumber, Slider, Typography, Spin, Tooltip, Divider, Checkbox } from 'antd';
import { QuestionCircleOutlined, DownOutlined, UpOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/router';
import Range from "../components/range";
import LendingPoolTable from "../components/lendingPoolTable";
import DepositNoLevModal from "../components/depositNoLevModal"
import VaultsDropdown from '../components/vaultsDropdown'

import useUnderlyingAmount from "../hooks/useUnderlyingAmount";
import useAddresses from "../hooks/useAddresses";
import useAssetData from "../hooks/useAssetData";
import getUserLendingPoolData from "../hooks/getUserLendingPoolData";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import {ethers} from "ethers";


function ProtectedYield() {
  const { account } = useWeb3React();
  const router = useRouter()

  const [price, setPrice] = useState(0)
  const [selectedRange, selectRange] = useState(0);
  const [ranges, setRanges] = useState([])
  const [currentVault, selectVault ] = useState(0)
  const [useNativeToken, setUseNativeToken] = useState(true)
  
  const [noLevInputs, setNoLevInputs] = useState([0,0])
  const [leverage, setLeverage] = useState(1);
  const [coverage, setCoverage] = useState(1);
  const [percentDebt, setPercentDebt] = useState(100);
  const [isSpinning, setSpinning] = useState(false);
  const onChangeLeverage = (newVal) => { setLeverage(newVal) }
  const onChangeCoverage = (newVal) => { setCoverage(newVal) }
  
  const ADDRESSES = useAddresses();
  const vaults = ADDRESSES['lendingPools'];
  const lendingPool = vaults.length > 0 ? vaults[currentVault] : {}
  const rangeAddresses = lendingPool['lpToken'] ? [ lendingPool['lpToken'] ] : []
  for (let p in lendingPool.ranges) rangeAddresses.push(lendingPool.ranges[p])
    
  // Selecting ranges to show: default is v2, if v3 ranges exist assume length >= 3
  let jsonRangeAddresses = JSON.stringify(rangeAddresses)
  useEffect ( () => { 
    if (!rangeAddresses || rangeAddresses.length == 0) { setRanges([]); return; }
    if (!price) { setRanges(rangeAddresses.slice(0, 4)); selectRange(0); return; }
    
    // first item is v2 pair
    let subset = [rangeAddresses[0]]

    for( let k = 1; k<rangeAddresses.length; k++){
      let prices = rangeAddresses[k].price.split('-')
      // if current active range: push previous, current and next range
      if ( price > prices[0] && price < prices[1] ){
        if ( k > 1 && k < rangeAddresses.length -1 ){ 
          //there's a range before and one after
          subset = [...subset, ...rangeAddresses.slice(k-1,k+2)]
          selectRange(2);
          break;
        }
        else if ( k == rangeAddresses.length -1){
          subset = [...subset, ...rangeAddresses.slice(k-2,k+1)]
          selectRange(3)
          break;
        }
        else if ( k == 1 ){
          selectRange(1)
          subset = [...subset, ...rangeAddresses.slice(1,4)]
          break;
        }
      }
    }
    setRanges(subset)
  }, [jsonRangeAddresses, price])

  var token0 = useAssetData(lendingPool.token0 ? lendingPool.token0.address : null, lendingPool.address)
  var token1 = useAssetData(lendingPool.token1 ? lendingPool.token1.address : null, lendingPool.address)
  var lpToken = useAssetData( lendingPool.lpToken ? lendingPool.lpToken.address : null, lendingPool.address )
  var lpContract = useLendingPoolContract(lendingPool.address)
  const selectedAsset =  useAssetData(ranges.length > 0 ? ranges[selectedRange].address : null, lendingPool.address)
  var insuranceAsset = useAssetData(selectedAsset.insuranceAsset, lendingPool.address)
  
  // Token amounts: if v3, use values from the TR smart contract - useCLPValues return $1 worth of tokens
  const tokenAmounts = useUnderlyingAmount(ranges.length > 0 ? ranges[selectedRange].address : null, lendingPool )
  
  const userAccountData = getUserLendingPoolData(lendingPool.address) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)
  const [isVisibleCollateral, setVisibilityCollateral] = useState(!(availableCollateral > 0))


  // Farm position
  const farm = async () => {
    let amount0 = tokenAmounts.amount0 * availableCollateral * percentDebt / 100 * leverage
    let amount1 = tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage

    if (amount0 > token0.tlv || amount1 > token1.tlv) { console.log('Not enough assets to borrow'); return;}
    let amounts = [
      ethers.utils.parseUnits( (amount0).toFixed(token0.decimals), token0.decimals),
      ethers.utils.parseUnits( (amount1).toFixed(token1.decimals), token1.decimals)
    ]
    const abi = ethers.utils.defaultAbiCoder;
    const POOL_ID = lendingPool.poolId;
    const farmMode = (selectedRange == 0 ? 1 : 0); // Full range UNIv2: mode 1, UNIv3-TokenisableRange mode 0
    let params = abi.encode(["uint", "uint8", "address", "address"], [POOL_ID, farmMode, account, rangeAddresses[selectedRange].address ]);
    try {
      console.log(["uint", "uint8", "address", "address"], [POOL_ID, farmMode, account, rangeAddresses[selectedRange].address ])
      console.log('flashhh', ADDRESSES["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0 )
      // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
      let res = await lpContract.flashLoan(ADDRESSES["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0)
    } 
    catch(e) {console.log('farm error', e)}
  }


  // Farm position
  const buyInsurance = async () => {
    let amount = ethers.utils.parseUnits( 
        parseFloat(coverage / 100 * selectedAsset.deposited * selectedAsset.oraclePrice / insuranceAsset.oraclePrice).toFixed(insuranceAsset.decimals), 
        insuranceAsset.decimals
      )
    const abi = ethers.utils.defaultAbiCoder;
    let params = abi.encode(["uint8", "uint", "address", "address"], [0, lendingPool.poolId, account, ethers.constants.AddressZero]);
    try {
      console.log(["uint8", "uint", "address", "address"], [0, lendingPool.poolId, account, ethers.constants.AddressZero ])
      console.log('flashhh', ADDRESSES["optionsPositionManager"], [insuranceAsset.address], [amount], [2], account, params, 0 )
      
      // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
      let res = await lpContract.flashLoan(ADDRESSES["optionsPositionManager"], [insuranceAsset.address], [amount], [2], account, params, 0)
    } 
    catch(e) {console.log('farm error', e)}
  }
  

  // rebalance no leverage inputs based on asset ratio and user input
  const setNoLevValues = (val) => {
    if ( val.asset0 == 0 || val.asset1 == 0 ) return setNoLevInputs([0,0])
    if (val.asset0 && tokenAmounts.amount0 > 0) return setNoLevInputs([val.asset0, tokenAmounts.amount1 * val.asset0 / tokenAmounts.amount0])
    if (val.asset1 && tokenAmounts.amount1 > 0) return setNoLevInputs([tokenAmounts.amount0 * val.asset1 / tokenAmounts.amount1, val.asset1])
  }

  const token0Amount = ethers.utils.parseUnits(
      parseFloat(noLevInputs[0]).toFixed(token0.decimals),
      token0.decimals
    )
  const token1Amount = ethers.utils.parseUnits(
      parseFloat(noLevInputs[1]).toFixed(token1.decimals),
      token1.decimals
    )

  return (
    <div>
      <Typography.Title>
        Protected Yield Farming {token0.name}-{token1.name}
        <VaultsDropdown vaults={vaults} selectVault={selectVault} currentVault={currentVault} />
      </Typography.Title>
      
      <Typography.Title level={2}>1. Pick a Range</Typography.Title>
      <Row gutter={16} style={{marginTop: 16, marginLeft: 24}}>
        <Col span={16}>
          <Row gutter={[16, 16]}>
            { ranges.map( (item, index) => <Col key={item.address + index} span={12}  className="gutter-row" type="flex">
                <Range address={item.address}
                  lendingPool={lendingPool.address}
                  priceRange={item.price? item.price : "Full"}
                  availableCollateral={availableCollateral}
                  bordered={selectedRange == index}
                  onClick={()=>{setNoLevInputs([0,0]); selectRange(index)}}
                  hasInsurance={!!item.insuranceAsset}
                  />
              </Col>
            )}
          </Row>
        </Col>
        <Col span={8} >
          <Card title="What is Protected Farming?">
            The AMM yield farmer collects good yield but is exposed to the asset price going down.<br /><br />
            Use pay-as-you-go ROE insurance to cap the downside risk.
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8} type="flex">
          <Typography.Title level={2}>2. Farm</Typography.Title>
          <Card title="No Leverage" bordered={false} style={{ marginLeft: 32, width: 330, height: 300 }} bodyStyle={{height: '100%'}}>
            <div style={{}}>
              <span>{token0.name}<span style={{ float: 'right', fontSize: 'smaller'}}>Wallet: {parseFloat(token0.wallet).toFixed(3)}</span></span>
              
              <br/>
              <InputNumber value={noLevInputs[0]} style={{ marginBottom: 12, width: '100%' }} 
                onChange={(e)=> setNoLevValues({asset0: e})}
              />
              <br/>
              <span style={{ width: '100%'}}>{token1.name}<span style={{ float: 'right', fontSize: 'smaller'}}>Wallet: {parseFloat(token1.wallet).toFixed(3)}</span></span>
              <br/>
              <InputNumber value={noLevInputs[1]} style={{ marginBottom: 12,  width: '100%' }}
                onChange={(e)=> setNoLevValues({asset1: e})}
              />
              <Checkbox checked={useNativeToken} onChange={(e)=>{setUseNativeToken(e.target.checked)}} style={{ marginBottom: 12, }} disabled>Add <strong>WETH</strong> / ETH</Checkbox><br/>
              <div style={{float: 'right'}}>
                <DepositNoLevModal 
                  vaultAddresses={ADDRESSES}
                  rangeAddress={rangeAddresses.length > 0 ? rangeAddresses[selectedRange].address : null} 
                  token0={token0} token1={token1}
                  token0Amount={token0Amount}
                  token1Amount={token1Amount}
                  isLpV2={selectedRange == 0}
                  useNativeToken={useNativeToken}
                />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={8} type="flex">
          <Typography.Title level={2}>
            3. Leverage? &nbsp;
            <Tooltip title="Careful with that slider!"><ExclamationCircleOutlined style={{ fontSize: 'smaller'}}/></Tooltip>
          </Typography.Title>
          
          <Card title={"Available Collateral: $"+availableCollateral * percentDebt /100} bordered={false} style={{ marginLeft: 32, width: 330, height: 300 }} bodyStyle={{height: '100%'}}>
              <h5 style={{ marginTop: 0, marginBottom: 0,  color: 'grey'}}>Leverage</h5>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <Slider min={1} max={10}  onChange={onChangeLeverage} style={{ minWidth: '90%'}}/>
              <span>{leverage}x</span>
            </div>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <h5 style={{marginTop: 0, marginBottom: 0, color: 'grey'}}>Potential Yield</h5>
              <span style={{color: 'lightgreen', fontWeight: 'bold'}}>
                {( leverage*(parseFloat(selectedAsset.feeApr)+parseFloat(selectedAsset.supplyApr)) ).toFixed(2)}%
              </span>
            </div>
            <h5 style={{marginTop: 0, marginBottom: 0, color: 'grey'}}>Borrow Amounts</h5>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <span> </span>
              <span>{ (tokenAmounts.amount0 * availableCollateral * percentDebt /100 * leverage).toFixed(3) } {token0.name} + {(tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage).toFixed(3)} {token1.name}</span>
            </div>
            <div style={{float: 'right'}}>
              <Button type="primary" onClick={farm}>{ isSpinning ? <Spin /> : <>Leverage Farm</> }</Button>
            </div>
          </Card>
        </Col>
        <Col span={8} type="flex">
          <Typography.Title level={2}>
            4. Get Insurance
          </Typography.Title>
          
          <Card title={"Farming Position: $"+(selectedAsset.deposited * selectedAsset.oraclePrice)} bordered={false} style={{ marginLeft: 32, width: 330, height: 300 }} bodyStyle={{height: '100%'}}>
              <h5 style={{ marginTop: 0, marginBottom: 0,  color: 'grey'}}>Coverage</h5>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <Slider min={1} max={100}  onChange={onChangeCoverage} style={{ minWidth: '85%' }}/>
              <span>{coverage}%</span>
            </div>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <h5 style={{marginTop: 0, marginBottom: 0, color: 'grey'}}>Funding Rate</h5>
              <span style={{color: 'lightgreen', fontWeight: 'bold'}}>
                {( leverage*(parseFloat(insuranceAsset.debtApr)) ).toFixed(2)}%
              </span>
            </div>
            <h5 style={{marginTop: 0, marginBottom: 0, color: 'grey'}}>Coverage Value</h5>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
              <span> </span>
              <span>${selectedAsset.insuranceAsset ? (selectedAsset.deposited * selectedAsset.oraclePrice * coverage / 100).toFixed(3) : '-'}</span>
            </div>
            <div style={{float: 'right'}}>
              <Button type="primary" onClick={buyInsurance}
                disabled={!selectedAsset.insuranceAsset || insuranceAsset.tlv < selectedAsset.deposited * selectedAsset.oraclePrice / insuranceAsset.oraclePrice * coverage / 100}
                >
                { isSpinning ? <Spin /> : 
                  insuranceAsset.tlv < selectedAsset.deposited * selectedAsset.oraclePrice / insuranceAsset.oraclePrice * coverage / 100 ?
                  <>Not enough supply</>
                  :<>Buy Insurance</> 
                }
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProtectedYield;
