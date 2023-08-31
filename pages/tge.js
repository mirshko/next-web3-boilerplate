import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Input, Button, Progress, Spin } from 'antd';
import { ethers } from "ethers";
import useAssetData from "../hooks/useAssetData";
import Crowdsale_ABI from "../contracts/Crowdsale.json";
import useContract from "../hooks/useContract";


// Display all user assets and positions in all ROE LPs
const TGE = ({}) => {
  const [tgeData, setTgeData] = useState({})
  const [amount, setAmount] = useState()
  const [isSpinning, setSpinning] = useState()
  var tp = new ethers.providers.JsonRpcProvider("http://localhost:8545") 
  const signer = tp.getSigner()
  const cs = new ethers.Contract("0x955573549C68302725da4D70a4B225aca1270193", Crowdsale_ABI, signer)
  const usdc = useAssetData("0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "0x1259F436D981c1DA8b279205b5dc405B1f6Bf80b")
  var isButtonDisabled = true;
  if (amount > 0 && amount < usdc.wallet && amount < tgeData.available) isButtonDisabled = false;

  useEffect(() => {
    const getData = async () => {
      var tpu = await cs.tokensPerUSDC()
      var startDate = await cs.startDate()
      var endDate = await cs.endDate()
      let data = {
        tpu: (await cs.tokensPerUSDC()).toNumber(),
        startDate: (await cs.startDate()).toNumber(),
        endDate: (await cs.endDate()).toNumber(),
        totalContributions: (await cs.totalContributions()).toNumber(),
        hardcap: (await cs.hardcap()).toNumber(),
        myContribution: (await cs.contributions(await signer.getAddress())).toNumber()
      }
      data.available = data.hardcap - data.totalContributions
      console.log(data, await signer.getAddress())
      setTgeData(data)
    }
    getData()
  }, [])
  
  
  const deposit = async () => {
    setSpinning(true)
    if (!amount) return;
    console.log(await signer.getAddress());
    try {
      let amountU = new ethers.utils.parseUnits(amount, 6);
      // await usdc.Contract.approve(cs.address, amountU)
      const result = await cs.deposit(amountU, {gasLimit: 10000000});
    }
    catch(e){
      console.log('deposit', e)
    }
    setSpinning(false)
  }
  
  const claim = async () => {
    setSpinning(true)
    try {
      const result = await cs.claim()
    }catch(e){
      console.log('claim', e)
    }
    setSpinning(false)
  }
  

  return (<div style={{ minWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography.Title>GoodEntry Public Sale</Typography.Title>
    <Row style={{ width: 1200}} gutter={24}>
      <Col md={12}>
        <Card title="Your Allocation">
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Amount</span>
            <span>Wallet: {parseFloat(usdc.wallet).toFixed(3)} USDC.e</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Input
              placeholder="Amount"
              suffix=<a href="#" onClick={()=>{setAmount(usdc.wallet)}}>Max</a>
              bordered={false}
              onChange={(e) => setAmount(e.target.value)}
              key="inputamount"
              value={amount}
              style={{ backgroundColor: "#1D2329", padding: 8, color: 'white' }}
            />
          </div>
          {isSpinning ? (
            <Button type="default" style={{ width: "100%" }}>
              <Spin />
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={deposit}
              disabled={isButtonDisabled}
               style={{ width: "100%" }}
            >
              Buy $GOOD
            </Button>
          )}
        </Card>
        <Card title="Deposit Info" style={{ marginTop: 24 }}>
          You deposited: {tgeData.myContribution} USDC.e<br/>
          You will get: {tgeData.myContribution * tgeData.tpu / 1e24} GOOD<br/>
          <Button style={{float: 'right'}} onClick={claim}>Claim</Button>
        </Card>
      </Col>
      <Col md={12}>
        <Card title={"Schedule"}>
          Start date: {new Date(tgeData.startDate * 1000).toString()}<br/>
          End date: {new Date(tgeData.endDate*1000).toString()}
          <Progress percent={10} showInfo={false} strokeColor="#10da5d" />
        </Card>
      </Col>
    </Row>
  </div>);
}

export default TGE;