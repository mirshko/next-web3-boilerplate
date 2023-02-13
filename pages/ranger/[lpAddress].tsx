import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import { Col, Row, Button, Card, Input, InputNumber, Slider, Typography, Spin, Tooltip, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/router';
import Range from "../../components/range";
import LendingPoolTable from "../../components/lendingPoolTable";
import DepositNoLevModal from "../../components/depositNoLevModal"
import Chart from '../../components/perps/chart'

import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import useAddresses from "../../hooks/useAddresses";
import useAssetData from "../../hooks/useAssetData";
import getUserLendingPoolData from "../../hooks/getUserLendingPoolData";
import useLendingPoolContract from "../../hooks/useLendingPoolContract";
import {ethers} from "ethers";

function Ranger() {
  const { account } = useWeb3React();
  const router = useRouter()
  let { lpAddress } = router.query

  const [price, setPrice] = useState(0)
  const [selectedRange, selectRange] = useState(0);
  const [ranges, setRanges] = useState([])
  const [noLevInputs, setNoLevInputs] = useState([0,0])
  const [leverage, setLeverage] = useState(1);
  const [percentDebt, setPercentDebt] = useState(90);
  const [isSpinning, setSpinning] = useState(false);
  const onChangeLeverage = (newVal) => { setLeverage(newVal) }

  const vaultAddresses = useAddresses(lpAddress)
  const lendingPool = vaultAddresses['lendingPools'].length > 0 ?  vaultAddresses['lendingPools'][0] : {}
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

  var token0 = useAssetData(lendingPool.token0 ? lendingPool.token0.address : null, lpAddress)
  var token1 = useAssetData(lendingPool.token1 ? lendingPool.token1.address : null, lpAddress)
  var lpToken = useAssetData( lendingPool.lpToken ? lendingPool.lpToken.address : null, lpAddress )
  var lpContract = useLendingPoolContract(lpAddress)
  const selectedAsset =  useAssetData(ranges.length > 0 ? ranges[selectedRange].address : null, lpAddress)
  
  // Token amounts: if v3, use values from the TR smart contract - useCLPValues return $1 worth of tokens
  const tokenAmounts = useUnderlyingAmount(ranges.length > 0 ? ranges[selectedRange].address : null, lendingPool )
  
  const userAccountData = getUserLendingPoolData(lpAddress) 
  var healthFactor = ethers.utils.formatUnits(userAccountData.healthFactor ?? 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData.availableBorrowsETH ?? 0, 8)

  // Farm position
  const farm = async () => {
    let amounts = [
      ethers.utils.parseUnits( (tokenAmounts.amount0 * availableCollateral * percentDebt / 100 * leverage).toFixed(token0.decimals), token0.decimals),
      ethers.utils.parseUnits( (tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage).toFixed(token1.decimals), token1.decimals)
    ]
    const abi = ethers.utils.defaultAbiCoder;
    const POOL_ID = lendingPool.poolId;
    const farmMode = (selectedRange == 0 ? 1 : 0); // Full range UNIv2: mode 1, UNIv3-TokenisableRange mode 0
    let params = abi.encode(["uint", "uint8", "address", "address"], [POOL_ID, farmMode, account, rangeAddresses[selectedRange].address ]);
    try {
      //console.log('flashhh', vaultAddresses["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0 )
    // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
    let res = await lpContract.flashLoan(vaultAddresses["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0)
    } catch(e) {console.log('farm error', e)}
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
        The Rangeooor {token0.name}-{token1.name}
      </Typography.Title>
      <Typography.Title level={2}>Pick a Range</Typography.Title>

      <Row gutter={16} style={{marginTop: 16}}>
        <Col span={12}>
          <Row gutter={[16, 16]}>
            { ranges.map( (item, index) => <Col key={item.address + index} span={12}  className="gutter-row" type="flex">
              <Range address={item.address}
                lendingPool={lpAddress}
                priceRange={item.price? item.price : "Full"}
                availableCollateral={availableCollateral}
                bordered={selectedRange == index}
                onClick={()=>{setNoLevInputs([0,0]); selectRange(index)}}
                />
            </Col>
            )}
          </Row>
        </Col>
        <Col span={12}>
          <Chart ohlcUrl={lendingPool.ohlcUrl} setPrice={setPrice} defaultInterval='4h' height={180} width={530} />
        </Col>
      </Row>

      <Typography.Title level={2}>Collateral</Typography.Title>
        <Typography.Paragraph>Base debt available: <span style={{ fontWeight: 'bold'}}>${availableCollateral} </span>
         - Health ratio: 
          <span style={{ color: (healthFactor > 1.01 ? "green" : (healthFactor > 1 ? "orange" : "red" ) ) }}>
            {healthFactor > 100 ? <span style={{fontSize: 'larger'}}> &infin; </span> : parseFloat(healthFactor).toFixed(3)}
          </span>&nbsp;    
          <Tooltip placement="right" title="Keep your health factor above 1.01 to avoid liquidations"><QuestionCircleOutlined /></Tooltip>
        </Typography.Paragraph>
        <LendingPoolTable assets={[token0, token1, selectedAsset]} lendingPool={lendingPool} />
      
      
      <Row gutter={16}>
        <Col span={7} type="flex">
          <Typography.Title level={2}>Farm<span style={{float:'right', fontSize: 'small', marginRight: 8, marginTop: 7}}>or</span></Typography.Title>
          
        </Col>
        <Col span={6} type="flex">
          <Typography.Title level={2}>Farm with Leverage</Typography.Title>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6} type="flex">
          <Card title="No Leverage" bordered={false} style={{ height: '100%' }} bodyStyle={{height: '100%'}}>
            <div style={{}}>
              <span>{token0.name}<span style={{ float: 'right', fontSize: 'smaller'}}>{parseFloat(token0.wallet).toFixed(3)}</span></span>
              
              <br/>
              <InputNumber value={noLevInputs[0]} style={{ marginBottom: 12, width: '100%' }} 
                onChange={(e)=> setNoLevValues({asset0: e})}
              />
              <br/>
              <span style={{ width: '100%'}}>{token1.name}<span style={{ float: 'right', fontSize: 'smaller'}}>{parseFloat(token1.wallet).toFixed(3)}</span></span>
              <br/>
              <InputNumber value={noLevInputs[1]} style={{ marginBottom: 24, width: '100%' }}
                onChange={(e)=> setNoLevValues({asset1: e})}
              />
              <DepositNoLevModal 
                vaultAddresses={vaultAddresses}
                rangeAddress={rangeAddresses.length > 0 ? rangeAddresses[selectedRange].address : null} 
                token0={token0} token1={token1}
                token0Amount={token0Amount}
                token1Amount={token1Amount}
                isLpV2={selectedRange == 0}
              />
            </div>
          </Card>
        </Col>
        <Col span={1} style={{}}><Divider type="vertical" style={{ height: '100%', margin: '0 50%'}} />
        </Col>
        <Col span={6}>
          <Card title="Base Amounts" bordered={false}>
            Debt available: {availableCollateral}
            <Row gutter={8} style={{ display: "flex", alignItems: 'center'}}>
              <Col span={20}><Slider defaultValue={percentDebt} min={1} max={100}  onChange={setPercentDebt} /></Col>
              <Col span={4}>{percentDebt}%</Col>
            </Row>
            
            {token0.name}
            <Input value={(tokenAmounts.amount0 * availableCollateral * percentDebt /100).toFixed(token0.decimals)}  style={{ marginBottom: 12 }} />
            {token1.name}
            <Input value={(tokenAmounts.amount1 * availableCollateral * percentDebt /100).toFixed(token1.decimals)} />
            <br />
            Total value: ${availableCollateral * percentDebt /100}

          </Card>
        </Col>
        <Col span={5}>
          <Card title="Choose a Leverage" bordered={false} style={{height: '100%'}}>
              <Row gutter={8} style={{ display: "flex", alignItems: 'center'}}>
                <Col span={20}><Slider min={1} max={10}  onChange={onChangeLeverage} /></Col>
                <Col span={4}>{leverage}x</Col>
              </Row>

              <h5 style={{marginBottom: 10, color: 'grey'}}>Potential Yield</h5>
              <Row gutter={2} justify="space-between">
                <Col>24h (1x)<br />{(parseFloat(selectedAsset.baseApr)+parseFloat(selectedAsset.supplyApr)).toFixed(2)}%</Col>
                <Col style={{margin: 'auto'}}>&rarr;</Col>
                <Col>
                  24h ({leverage}x)<br />
                  <span style={{color: 'lightgreen', fontWeight: 'bold'}}>{( leverage*(parseFloat(selectedAsset.baseApr)+parseFloat(selectedAsset.supplyApr)) ).toFixed(2)}%</span>
                </Col>
              </Row>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card title="Execute"  bordered={false} style={{height: '100%'}}>
            {/* Collateral is already in LP, so need to have a smart contract function that flashloans the required assets and deposit in TR
                Assets amount are leverage * asset in base amount form
            */}
            <strong>Farm {lendingPool.name}</strong><br />
            Price range: {selectedRange == 0 ? "Full Range" : rangeAddresses[selectedRange].price } <br /><br />
            <strong>With</strong><br />
            { (tokenAmounts.amount0 * availableCollateral * percentDebt /100 * leverage).toFixed(3) } {token0.name} + {(tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage).toFixed(3)} {token1.name}<br /><br/>
            <Button type="primary" onClick={farm}>{ isSpinning ? <Spin /> : <>Leverage Farm</> }</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Ranger;

// Generates `/ranger/0x11` and `/ranger/0x222`
export async function getStaticPaths() {
  return {
    paths: [
      { params: { lpAddress: '0xD14a7c302051A0F1e9cE8e9a8C4845a45F41B46f' } }, // Ethereum ETH-USDC
      { params: { lpAddress: '0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1' } }, // Polygon ETH-USDC
      { params: { lpAddress: '0xBfdDD4a965BdB753dcEAA386ED9B19B655407967' } }, // Polygon MATIC-USDC
      { params: { lpAddress: '0x60b3f0C7709075776C38eC5812C8A1EF9fD522d7' } }, // Arbitrum ETH-USDC
    ],
    fallback: false, // can also be true or 'blocking'
  }
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps(context) {
  return {
    // Passed to the page component as props
    props: { post: {} },
  }
} 