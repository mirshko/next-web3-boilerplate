import { useState, useEffect } from "react";
import { Button, Row, Col, Typography, Card, Input } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import axios from "axios";
import { ethers } from "ethers";

const Referrals = ({}) => {
  const router = useRouter();
  let { ref } = router.query;
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
    
  
  const getRef = async () => {
    try {
      const refs = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json")).data;
      if (refs.hasOwnProperty(account)){
        const myrefs = refs[account];
        myrefs.hasOwnProperty("ref") ? setReferrer(myrefs["ref"]) : setReferrer() 
        myrefs.hasOwnProperty("name") ? setRefName(myrefs["name"]) : setRefName() 
        myrefs.hasOwnProperty("affiliates") ? setAffiliates(myrefs["affiliates"]) : setAffiliates([])
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
    console.log("check", account)
    if(account) getRef()
  }, [account])
  
  
  return (<div>
    <Typography.Title>Referrals</Typography.Title>
    <Typography.Text>Earn rewards with the GoodEntry <a href='#'>Referral Program</a>.</Typography.Text>
    <Row gutter={48} style={{marginTop: 24}}>
      <Col md={12}>
        <Card title="Referrer">
        { referrer ?
          <div>Your referrer is <strong>{referrer}</strong>
          </div>
          :
          <div>
            <Input.Search 
              style={{ marginTop: 24}}
              enterButton={isProcessing ? <LoadingOutlined /> : <>Set Referee</>}
              onSearch={setMyReferrer}
              onChange={(e)=>{setRefStatus(null); setInputRef(e.target.value)}}
            />
            {refValidationStatus ? <span style={{ color: '#dc4446'}}>Invalid Referee</span> : <></>}
          </div>
        }
        </Card>
        <Card title="Referral Code" style={{ marginTop: 24 }}>
        {
          refName ? 
            <p>
              Your referral code is <strong>{refName}</strong><br /><br />
              Share GoodEntry with your friends and earn rewards!
            </p>
            : <div>
                You don&apos;t have a referral code yet.<br />Create a new one to invite friends and start earning rewards!<br />
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Input.Search
                    style={{ marginTop: 24}}
                    enterButton={isProcessing ? <LoadingOutlined /> : <>Register Referral Code</>}
                    onSearch={setMyRefName}
                    onChange={(e)=>{setStatus(null); setInputValue(e.target.value)}}
                    status={validationStatus}
                  />
                </div>
                {validationStatus ? <span style={{ color: '#dc4446'}}>{error}</span> : <></>}
              </div>
        }
        </Card>
      </Col>
      <Col md={12}>
        <Card title="Affiliates">
        {
          affiliates ? affiliates.map( affiliate => {
            return (<>
                <span key={affiliate}>{affiliate}</span>
                <br />Bonus per round: 0
              </>)
          })
          : <>You don&apos;t have any affiliates. Share your referral link and start earning rewards!</>
        }
        </Card>
      </Col>
    </Row>
  </div>)
}


export default Referrals;