import { useState, useEffect } from "react";
import { Button, Row, Col, Typography, Card, Input, notification } from "antd";
import { LoadingOutlined, CopyOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import axios from "axios";
import { ethers } from "ethers";

const Referrals = ({}) => {
  const router = useRouter();
  let { ref } = router.query;
  console.log(router, router.query, ref)
  const { account, library } = useWeb3React();

  const [refName, setRefName] = useState();
  const [referrer, setReferrer] = useState();
  const [affiliates, setAffiliates] = useState([]);
  const [inputValue, setInputValue] = useState();
  const [validationStatus, setStatus] = useState();
  const [inputRef, setInputRef] = useState(ref);
  const [refValidationStatus, setRefStatus] = useState();
  const [error, setError] = useState();
  const [isProcessing, setProcessing] = useState(false);
  const [api, contextHolder] = notification.useNotification();
    
  
  const getRef = async () => {
    try {
      const refs = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json")).data;
      setReferrer() 
      setRefName()
      setAffiliates()
      if (refs.hasOwnProperty(account)){
        const myrefs = refs[account];
        if (myrefs.hasOwnProperty("ref") ) setReferrer(myrefs["ref"])
        if (myrefs.hasOwnProperty("name") ) setRefName(myrefs["name"])
        if (myrefs.hasOwnProperty("affiliates") ) setAffiliates(myrefs["affiliates"])
      }
    }
    catch(e){
      console.log("Err fetching referrals", e)
    }
  }
  
  
  const setMyRefName = async () => {
    if (!inputValue|| !account) return;
    setProcessing(true);
    try {
      const signer = library.getSigner(account);
      const sig = await signer.signMessage("SetName:"+inputValue)
      const refnames = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json?account="+account+"&name="+inputValue+"&sig="+sig)).data;
      await new Promise(resolve => setTimeout(resolve, 4000));
      getRef()
    }
    catch(e){
      console.log("Err setting referrals", e)
    }
    setProcessing(false);
  }  
  
  
  const setMyReferrer = async () => {
    if (!inputRef|| !account) return;
    setProcessing(true);
    try {
      const signer = library.getSigner(account);
      const sig = await signer.signMessage("SetReferrer:"+inputRef)
      const refnames = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json?account="+account+"&ref="+inputRef+"&sig="+sig)).data;
      await new Promise(resolve => setTimeout(resolve, 4000));
      getRef()
    }
    catch(e){
      console.log("Err setting referrer", e)
    }
    setProcessing(false);
  }
  
  
  useEffect(()=>{
    if(account) getRef()
    if (ref) setInputRef(ref)
  }, [account, ref])


  const copyNotification = () => {
    api.info({
      message: 'Copied to Clipboard.',
      placement: "bottom",
    });
  };

  const refLink = "https://alpha.goodentry.io/referrals?ref="
  
  return (<div>
  {contextHolder}
    <Typography.Title>Referrals</Typography.Title>
    <Typography.Text>Earn rewards with the GoodEntry <a href='#'>Referral Program</a>.</Typography.Text>
    <Row gutter={8} style={{marginTop: 24}}>
      <Col md={12}>
        <Row gutter={8} style={{marginBottom: 8}}>
          <Col sm={12}>
            <Card bodyStyle={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <span style={{ fontSize: 'small' }}>Total Referral(s)</span>
              <span style={{ fontSize: 'x-large', color: 'white', fontWeight: 'bold'}}>42</span>
            </Card>
          </Col>
          <Col sm={12}>
            <Card bodyStyle={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <span style={{ fontSize: 'small' }}>Total Referral Rewards</span>
              <span style={{ fontSize: 'x-large', color: 'white', fontWeight: 'bold'}}>42</span>
            </Card>
          </Col>
        </Row>
      
        <Card title={<span style={{color: '#8A9098'}}>REFERRER</span>}>        
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexGrow: 2, marginBottom: 16 }}>
            <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end' }}>
              {referrer 
                ? <div style={{fontWeight: 500}}>Referrer</div> 
                : <Button type='primary' style={{ width: 150, fontWeight: 500 }} onClick={setMyReferrer} loading={isProcessing}>Set My Referrer</Button> 
              }
            </div>
            { referrer 
              ? <>Referrer</> 
              : <Input value={inputRef} onChange={(e)=>{setRefStatus(null); console.log('change to', e.target.value); setInputRef(e.target.value)}} /> 
            }
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexGrow: 2, marginBottom: 16}}>
            <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              {refName 
                ? <div style={{fontWeight: 500}}>Ref Code</div> 
                : <Button type='primary' style={{fontWeight: 500}} onClick={setMyReferrer} loading={isProcessing}>Create Ref Code</Button> 
              }
            </div>
            {refName 
              ? <Input value={refName}
                  suffix={<div style={{cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(refName); copyNotification()}}>
                    <CopyOutlined style={{color: 'white'}}/>
                  </div>}
                />
              : <Input onChange={(e)=>{setRefStatus(null); setInputRef(e.target.value)}} /> 
            }
          </div>
          {
            refName 
              ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexGrow: 2, marginBottom: 12}}>
                  <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <div style={{fontWeight: 500}}>Ref Link</div> 
                  </div>
                  <Input 
                        value={refLink+refName}
                        suffix={<div style={{cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(refLink+refName); copyNotification()}}>
                          <CopyOutlined style={{color: 'white'}}/>
                        </div>}
                      />
                </div>
              : <></>
          }
        </Card>
      </Col>
      <Col md={12}>
        <Card title={<span style={{color: '#8A9098'}}>AFFILIATES</span>}>
        <table >
          <thead>
            <tr style={{ padding: 0}}>
              <th style={{ padding: 0}}></th>
              <th align='left' style={{color: 'white', padding: 0}}>Account</th>
              <th align='left' style={{color: 'white', padding: 0}}>TVL</th>
              <th align='left' style={{color: 'white', padding: 0}}>Rewards Earned ($GOOD)</th>
            </tr>
          </thead>
          <tbody>
          {
            affiliates ? affiliates.map( (affiliate, i) => {
              console.log(affiliate, i)
              return (<tr key={affiliate}>
                  <td style={{ padding: 0}}>{i}</td>
                  <td style={{ padding: 0}}>{affiliate.substring(0,6)}...{affiliate.substring(36,42)}</td>
                  <td style={{ padding: 0}}>-</td>
                  <td style={{ padding: 0}}>-</td>
                </tr>)
            })
            : <>You don&apos;t have any affiliates. Share your referral link and start earning rewards!</>
          }
          </tbody>
        </table>

        </Card>
      </Col>
    </Row>
  </div>)
}


export default Referrals;