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
  const [refCode, setRefCode] = useState();
  const [inputValue, setInputValue] = useState();
  const [validationStatus, setStatus] = useState();
  const [inputRef, setInputRef] = useState(ref);
  const [refValidationStatus, setRefStatus] = useState();
  const [error, setError] = useState();
  const [isProcessing, setProcessing] = useState(false);
  
  const setRef = (newRefCode) => {
    const rc = JSON.parse(localStorage.getItem("refCode") || '{}')
    rc[account] = newRefCode
    localStorage.setItem("refCode", JSON.stringify(rc));
    setRefCode(newRefCode);
  }
  
  
  useEffect(() => {
    const checkRef = async () => {
      const rc = JSON.parse(localStorage.getItem("refCode") || '{}')
      if( rc && account in rc ) setRefCode(rc[account]);
    }
    if (account) checkRef();
  }, [account])
  
  
  const setReferee = async () => {
    if (!inputRef || !account) return;
    setProcessing(true);
    // sign message to validate ref as account ref (to prevent spoofing)
    try {
      const signer = library.getSigner(account);
      const sig = await signer.signMessage("SetReferee:"+inputRef)
console.log(sig)
      const refnames = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json?account="+account+"&ref="+inputRef+"&sig="+sig)).data;
      console.log(refnames)
      // server will pick up the referer name in logs and save it, for now

      var newRefCode;
      for (const i in refnames){
        if (i == account) {
          newRefCode = refnames[i]
          if (!refnames[i].ref) newRefCode.ref = inputRef; // set new referee if not existing
          break;
        }
      }
      if (newRefCode) setRef(newRefCode);
      else setRefCode()
    }
    catch(e) {console.log('set ref', e)}
    setProcessing(false);
  }
  
  
  const search = async () => {
    if (!account) return;
    setProcessing(true);
    try {
      if ( ! /^[a-zA-Z0-9]+$/.test(inputValue) ){
        setStatus('error');
        setError('Only characters and numbers allowed');
        throw new Error("Non alphanum referral");
      }
      
      const refnames = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json?account="+account+"&name="+inputValue)).data;
      // server will also pick up the query in the logs and register for next time
      if (refnames[inputValue]){
        // already existing?
        setStatus('error');
        setError('Referral Code already taken.');
      }
      else {
        // server side script will update the list sometime, meanwhile register here
        setRef({name: inputValue, account: account, referrals: []})
      }
    }
    catch(e) {console.log(e)}
    setProcessing(false);
  }
  
  
  return (<div>
    <Typography.Title>Referrals</Typography.Title>
    <Typography.Text>Earn rewards with the GoodEntry <a href='#'>Referral Program</a>.</Typography.Text>
    <Row gutter={48} style={{marginTop: 24}}>
      <Col md={12}>
        <Card title="Referee">
        {refCode && refCode.ref ?
          <div>You referee is <strong>{refCode.ref}</strong>
          </div>
          :
          <div>
            <Input.Search 
              style={{ marginTop: 24}}
              enterButton={isProcessing ? <LoadingOutlined /> : <>Set Referee</>}
              onSearch={setReferee}
              onChange={(e)=>{setRefStatus(null); setInputRef(e.target.value)}}
            />
            {refValidationStatus ? <span style={{ color: '#dc4446'}}>Invalid Referee</span> : <></>}
          </div>
        }
        </Card>
        <Card title="Referral Code" style={{ marginTop: 24 }}>
        {
          refCode && refCode.name ? 
            <p>
              Your referral code is <strong>{refCode.name}</strong><br /><br />
              Share GoodEntry with your friends and earn rewards!
            </p>
            : <div>
                You don&apos;t have a referral code yet.<br />Create a new one to and start earning rewards!<br />
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Input.Search
                    style={{ marginTop: 24}}
                    enterButton={isProcessing ? <LoadingOutlined /> : <>Create Referral</>}
                    onSearch={search}
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
          refCode && refCode.affiliates ? refCode.affiliates.map( affiliate => {
            return (<h3 key={affiliate}>{affiliate}</h3>)
          })
          : <>You don&apos;t have any affiliates. Share your referral link and start earning rewards!</>
        }
        </Card>
      </Col>
    </Row>
  </div>)
}


export default Referrals;