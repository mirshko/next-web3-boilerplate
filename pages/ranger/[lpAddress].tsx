import { useWeb3React } from "@web3-react/core";
import { useState } from 'react';
import { Col, Row, Button, Card, Input, Slider, Typography, Spin, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/router';
import Range from "../../components/range";
import LendingPoolTable from "../../components/lendingPoolTable";

import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import useAddresses from "../../hooks/useAddresses";
import useAssetData from "../../hooks/useAssetData";
import getUserLendingPoolData from "../../hooks/getUserLendingPoolData";
import useLendingPoolContract from "../../hooks/useLendingPoolContract";
import {ethers} from "ethers";

function Ranger() {
  const { account } = useWeb3React();
  const router = useRouter()
  let { lendingPoolAddress } = router.query
  const [selectedRange, selectRange] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [percentDebt, setPercentDebt] = useState(90);
  const [isSpinning, setSpinning] = useState(false);
  const onChangeLeverage = (newVal) => { setLeverage(newVal) }
  
  if ( !lendingPoolAddress ) lendingPoolAddress = "0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1"  
  const vaultAddresses = useAddresses(lendingPoolAddress)
  const rangeAddresses = [
    vaultAddresses['lendingPools'][0]['lpToken']
  ]
  for (let p of vaultAddresses['lendingPools'][0].ranges) rangeAddresses.push(p)
  
  let lpInfo = vaultAddresses['lendingPools'][0]
  var token0 = useAssetData(lpInfo.token0.address, lendingPoolAddress)
  var token1 = useAssetData(lpInfo.token1.address, lendingPoolAddress)
  var lpToken = useAssetData( lpInfo.lpToken.address, lendingPoolAddress )
  var lpContract = useLendingPoolContract(lendingPoolAddress)

  var assets = [
    { key: 0, ...token0 },
    { key: 1, ...token1 },
    //{ key: 2, ...lpToken},
  ];
  var yields = [
    {week: 14, month: 25.77, halfyear: 9.2},
    {week: 12.5, month: 39.9, halfyear: 42.3},
    {week: 0, month: 0, halfyear: 2.5},
    {week: 1, month: 1, halfyear: 2.5},
  ]
  
  // Token amounts: if v3, use values from the TR smart contract - useCLPValues return $1 worth of tokens
  const tokenAmounts = useUnderlyingAmount(rangeAddresses[selectedRange].address, lpInfo )
  
  const userAccountData = getUserLendingPoolData(lendingPoolAddress) 
  var healthFactor = ethers.utils.formatUnits(userAccountData ? userAccountData.healthFactor : 0, 18)
  var availableCollateral = ethers.utils.formatUnits(userAccountData ? userAccountData.availableBorrowsETH : 0, 8)

  // Farm position
  const farm = async () => {
    let amounts = [
      ethers.utils.parseUnits( (tokenAmounts.amount0 * availableCollateral * percentDebt / 100 * leverage).toFixed(token0.decimals), token0.decimals),
      ethers.utils.parseUnits( (tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage).toFixed(token1.decimals), token1.decimals)
    ]
    const abi = ethers.utils.defaultAbiCoder;
    const POOL_ID = lpInfo.poolId;
    const farmMode = (selectedRange == 0? 1 : 0); // Full range UNIv2: mode 1, UNIv3-TokenisableRange mode 0
    let params = abi.encode(["uint", "uint8", "address", "address"], [POOL_ID, farmMode, account, rangeAddresses[selectedRange].address ]);
    try {
      console.log('flashhh', vaultAddresses["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0 )
    // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
    let res = await lpContract.flashLoan(vaultAddresses["rangerPositionManager"], [token0.address, token1.address], amounts, [2, 2], account, params, 0)
    } catch(e) {console.log('farm error', e)}
  }


  return (
    <div>
      <Typography.Title>
        The Rangeooor {token0.name}-{token1.name}
      </Typography.Title>
      <Typography.Title level={2}>Pick a Range</Typography.Title>

      <img src="/ranger-dummy.png"  alt="explanation" width="100%"  />
      <Row gutter={16}>
        <Col span={6}  type="flex">
          <Range address={rangeAddresses[0].address}
            lendingPool={lendingPoolAddress}
            priceRange="Full" 
            yields={yields[0]}
            availableCollateral={availableCollateral}
            bordered={selectedRange == 0}
            onClick={()=>{selectRange(0)}}
            />
        </Col>
        <Col span={6}  type="flex">
          <Range address={rangeAddresses[1].address}
            lendingPool={lendingPoolAddress}
            priceRange="750-1250" 
            yields={yields[1]}
            availableCollateral={availableCollateral}
            bordered={selectedRange == 1}
            onClick={()=>{selectRange(1)}}
            />
        </Col>
        <Col span={6}  type="flex">
          <Range address={rangeAddresses[2].address}
            lendingPool={lendingPoolAddress}
            priceRange="1250-1750" 
            yields={yields[2]}
            bordered={selectedRange == 2}
            onClick={()=>{selectRange(2)}}
          />
        </Col>
        <Col span={6}  type="flex">
          <Range address={rangeAddresses[3].address}
            lendingPool={lendingPoolAddress}
            priceRange="1750-2250" 
            yields={yields[3]}
            bordered={selectedRange == 3}
            onClick={()=>{selectRange(3)}}
          />
        </Col>
      </Row>
        
        {/*<Row gutter={16}>
        <Col span={12} type="flex">
          <img src="/ranger-dummy2.png"  alt="explanation" width="100%"  />
        </Col>
        <Col span={6} type="flex">
          <Range address={rangeAddresses[0].address}
            lendingPool={lendingPoolAddress}
            priceRange="750-1250" 
            yields={yields[0]}
            availableCollateral={availableCollateral}
            bordered={selectedRange == 0}
            onClick={()=>{selectRange(0)}}
            />
          <Range address={rangeAddresses[1].address}
            lendingPool={lendingPoolAddress}
            priceRange="1250-1750" 
            yields={yields[1]}
            bordered={selectedRange == 1}
            onClick={()=>{selectRange(1)}}
          />
          <Range address={rangeAddresses[2].address}
            lendingPool={lendingPoolAddress}
            priceRange="1750-2250" 
            yields={yields[2]}
            bordered={selectedRange == 2}
            onClick={()=>{selectRange(2)}}
          />
        </Col>
        <Col span={6} type="flex">
          <Range 
            lendingPool={lendingPoolAddress}
            priceRange="Full" 
            yields={yields[3]}
            availableCollateral={availableCollateral}
            bordered={selectedRange == 3}
            onClick={()=>{selectRange(3)}}
            />
        </Col>
</Row>*/}

      <Typography.Title level={2}>Collateral</Typography.Title>
        <Typography.Paragraph>Base debt available: ${availableCollateral}</Typography.Paragraph>
        <Typography.Paragraph>Health ratio: 
          <span style={{ color: (healthFactor > 1.01 ? "green" : (healthFactor > 1 ? "orange" : "red" ) ) }}>
            {parseFloat(healthFactor).toFixed(2)} 
          </span>&nbsp;    
          <Tooltip placement="right" title="Keep your health factor above 1.01 to avoid liquidations"><QuestionCircleOutlined /></Tooltip>
        </Typography.Paragraph>
        <LendingPoolTable assets={assets} lendingPool={lpInfo} />
      
      <Typography.Title level={2}>Farm</Typography.Title>
      
      <Row gutter={16} >
        <Col span={8}>
          <Card title="Base Amounts" bordered={false}>
            Debt available: {availableCollateral}
            <Row gutter={8} style={{ display: "flex", alignItems: 'center'}}>
              <Col span={20}><Slider defaultValue={percentDebt} min={1} max={100}  onChange={setPercentDebt} /></Col>
              <Col span={4}>{percentDebt}%</Col>
            </Row>
            
            {token0.name}
            <Input value={(tokenAmounts.amount0 * availableCollateral * percentDebt /100).toFixed(token0.decimals)} />{/* TODO: properly calculate, here we just say tokenAmounts is $1 */}
              {token1.name}
            <Input value={(tokenAmounts.amount1 * availableCollateral * percentDebt /100).toFixed(token1.decimals)} />
            <br />
            Total value: ${availableCollateral * percentDebt /100}

          </Card>
        </Col>
        <Col span={8}>
          <Card title="Choose a Leverage" bordered={false} style={{height: '100%'}}>
              <Row gutter={8} style={{ display: "flex", alignItems: 'center'}}>
                <Col span={20}><Slider min={1} max={10}  onChange={onChangeLeverage} /></Col>
                <Col span={4}>{leverage}x</Col>
              </Row>

              <h5 style={{marginBottom: -10, color: 'grey'}}>Potential Yield</h5>
              <Row gutter={2} justify="space-between">
                <Col style={{ alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                  <p>1 Week</p><p>{yields[selectedRange] ? (leverage * yields[selectedRange].week).toFixed(2) : 0 }%</p>
                </Col>
                <Col style={{ alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                  <p>1 Month</p><p>{yields[selectedRange] ? (leverage * yields[selectedRange].month).toFixed(2) : 0 }%</p>
                </Col>
                <Col style={{ alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                  <p>6 Months</p><p>{yields[selectedRange] ? (leverage * yields[selectedRange].halfyear).toFixed(2) : 0 }%</p>
                </Col>
              </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Execute"  bordered={false} style={{height: '100%'}}>
            {/* Collateral is already in LP, so need to have a smart contract function that flashloans the required assets and deposit in TR
                Assets amount are leverage * asset in base amount form
            */}
            <strong>Farm {lpInfo.name}</strong><br />
            Price range: {selectedRange == 0 ? "Full Range" : rangeAddresses[selectedRange].price } <br /><br />
            <strong>With</strong><br />
            { (tokenAmounts.amount0 * availableCollateral * percentDebt /100 * leverage).toFixed(3) } {token0.name} + {(tokenAmounts.amount1 * availableCollateral * percentDebt / 100 * leverage).toFixed(3)} {token1.name}<br /><br/>
            <Button type="primary" onClick={farm}>{ isSpinning ? <Spin /> : <>Leverage Farm</> }</Button>
          </Card>
        </Col>
      </Row>

      <Typography.Title level={2}>Details</Typography.Title>
      <Row gutter={16} >
        <Col>
          <Card>
            <ul>
              <li>Price movement will cause Impermanent Loss: the farming position value will differ from the assets borrowed to farm. If the difference increases too much, liquidations can occur</li>
              <li>Before a liquidation happen, a soft deleveraging may happen to reduce the user&apos;s debt. It carries a penalty of 1% of the liquidated amount (e.g the user&apos;s healt ratio reaches 1.01, 10% of the debt is soft liquidated, with a 1% penalty which is 0.1% of the total debt.</li>
              <li></li>
              <li></li>
            </ul>
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
    paths: [{ params: { lpAddress: '0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1' } }, { params: { lpAddress: '0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1' } }],
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