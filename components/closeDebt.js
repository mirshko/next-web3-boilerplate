import { useState } from 'react';
import  { Button, Modal, Input, notification, Spin } from 'antd';
import { useWeb3React } from "@web3-react/core";
import useRangerPositionManager from "../hooks/useRangerPositionManager"
import {ethers} from 'ethers';

const CloseDebt = ({ asset, type, vault }) => {
  const { account, chainId } = useWeb3React();
  const rpm = useRangerPositionManager();
  const [visible, setVisible ] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [api, contextHolder] = notification.useNotification();
  const [isSpinning, setSpinning] = useState(false);
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  
  var balance = 0
  if (type == "closeV2" || type == "closeRange" ) balance = asset.deposited;
  else balance = asset.debt;
  
  const closeTx = async () => {
    try {
      setSpinning(true)
      console.log("closeee", vault.poolId, account, asset.address, ethers.utils.parseUnits(inputValue, 18).toString()
      )
      let result = await rpm.closeRange(vault.poolId, account, asset.address, ethers.utils.parseUnits(inputValue, 18));
      openNotification("success", "Tx Sent", "Tx mined")
    }
    catch(e){
      console.log(e.message);
      openNotification("error", e.code, e.message)
    }
    setSpinning(false);
  }

  
  return (<>
    <Button type="default" size="small" onClick={() => {setVisible(true);}}>Close Position</Button>
    <Modal open={visible} onOk={() => {setVisible(false);}} onCancel={() => {setVisible(false);}}
        width={400}
        footer={null}
        title="Close Crab Strategy Position"
    >
      Remove assets from Crab Strategy, repay underlying token debt and deposit remaining assets in the vault.<br /><br />
      <div className="formDiv">
        {contextHolder}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(balance)}} >Wallet: {balance}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={balance} onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={asset.icon} width={18} alt="tokenIcon" />&nbsp;{asset.name}</>}
        />
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%'}} onClick={() => closeTx()} disabled={inputValue==0 || isSpinning} >
          { isSpinning ? <Spin /> : <>Close Position</> }
        </Button>
      </div>
    </Modal>
  </>)
  
}


export default CloseDebt;