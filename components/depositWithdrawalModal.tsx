import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, notification } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useTokenContract from "../hooks/useTokenContract";
import { useWeb3React } from "@web3-react/core";

const DepositWithdrawalModal = ({asset, lendingPool, size}) =>  {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [lpAllowance, setLpAllowance] = useState(ethers.constants.Zero);
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction] = useState('Supply')
  
  const router = useRouter()
  const { account, chainId } = useWeb3React();
  
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  
  const lendingPoolContract = useLendingPoolContract(lendingPool.address )
  const tokenContract = useTokenContract(asset.address)
  
	const openModal = () => { setVisible(true)}
	const closeModal = () => {setVisible(false)}
  
  var nativeToken = false;
  if ( asset.name == 'ETH' && (chainId == 1 || chainId == 42161 )) nativeToken = true;
  if (asset.name == 'MATIC' && (chainId == 137 || chainId == 1337) ) nativeToken = true;
  
  useEffect(() => {
    if (nativeToken || !tokenContract) return;
    // to deposit an ERC20 asset we check allowance
    const checkAllowance = async () => {
      const result = await tokenContract.allowance(account, lendingPool.address)
      setLpAllowance(result)
    }
    try {
      checkAllowance()
    } catch(e){console.log('check allowance dWM', e)}
  }, [account, asset, tokenContract, nativeToken, lendingPool.address])
  


  const goTxGo = async (action) => {
    try {
      setSpinning(true)
      var result;
      if(action == "Approve"){
        result = await tokenContract.approve(lendingPool.address, ethers.constants.MaxUint256)
      }
      else if (action =="Supply"){
        if (nativeToken){
          result = await lendingPoolContract // TODO
        } 
        else {
          result = await lendingPoolContract.deposit(asset.address, ethers.utils.parseUnits(inputValue, asset.decimals), account, 0)
        }
        closeModal()
      }
      else if (action == "Withdraw") {
        result = await lendingPoolContract.withdraw(asset.address, ethers.utils.parseUnits(inputValue, asset.decimals), account)
        closeModal()
      }
      openNotification("success", "Tx Sent", "Tx mined")
    }
    catch(e){
      console.log(e.message);
      openNotification("error", e.code, e.message)
    }
    setSpinning(false);
  }

  var actionComponent = action+" "+asset.name;
  if ( !nativeToken && inputValue && action == "Supply" && ethers.utils.parseUnits(parseFloat(inputValue).toFixed(asset.decimals), asset.decimals).gt(lpAllowance) ){
      actionComponent = "Approve "+asset.name;
      setAction("Approve")
    }
  var assetBal = action == "Withdraw" ? asset.deposited : asset.wallet;
  
  
  return (
    <>
      <Button type="primary" onClick={openModal} size={size ?? 'default'}>
        Deposit / Withdraw
      </Button>
      <Modal open={visible} onOk={closeModal} onCancel={closeModal}
        width={400}
        footer={null}
      >
        <Tabs 
          defaultActiveKey="Supply" 
          centered
          onChange={(activeKey) => {setAction(activeKey)}}
          items={[
            {
              label: (<span style={{ width: '50%' }}><UploadOutlined />Supply {asset.name}</span>),
              key: 'Supply',
            },
            {
              label: (<span style={{ width: '50%' }}><DownloadOutlined />Withdraw {asset.name}</span>),
              key: 'Withdraw',
            }
          ]}
         />
         
      <div className="formDiv">
        {contextHolder}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(assetBal)}} >Wallet: {assetBal}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={assetBal} onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={asset.icon} width={18} alt="tokenIcon" />&nbsp;{asset.name}</>}
        />
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%'}} onClick={() => goTxGo(action)} >
          { isSpinning ? <Spin /> : <>{actionComponent}</> }
        </Button>
      </div>
      </Modal>
    </>
  )
}


export default DepositWithdrawalModal;