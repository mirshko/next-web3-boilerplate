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
      if (!(rc && account in rc) || ref) {
        // if no data in local storage, or if there is  aref code, need to process anyway
        const refnames = (await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/referrals.json?account="+account+(ref ? "&ref="+ref : ""))).data;
        // server will pick up the referer name in logs and save it, for now
        // TODO: security? need to sign to accept being referee

        var newRefCode;
        for (const i in refnames){
          if (i == account) {
            newRefCode = refnames[i]
            if (!refnames[i].ref) newRefCode.ref = ref; // set new referee if not existing
            break;
          }
        }
        if (newRefCode) setRef(newRefCode);
        else setRefCode()
      }
    }
    if (account) checkRef();
  }, [account])
  
  
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
        <Card title="Referral Code">
        {
          refCode && refCode.name ? 
            <p>
              Your referral code is <strong>{refCode.name}</strong><br /><br />
              Share GoodEntry with your friends and earn rewards!
            </p>
            : <div>
                You don&quot;t have a referral code yet.<br />Create a new one to and start earning rewards!<br />
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
          : <>You don&quot;t have any affiliates. Share your referral link and start earning rewards!</>
        }
        </Card>
      </Col>
    </Row>
  </div>)
}


export default Referrals;