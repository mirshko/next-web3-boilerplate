import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, notification } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useUnderlyingAmount from "../hooks/useUnderlyingAmount";
import useTokenContract from "../hooks/useTokenContract";
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import useAssetData from "../hooks/useAssetData";
import { useWeb3React } from "@web3-react/core";

const DepositWithdrawalTickerModal = ({asset, vault, size, oracleAddress}) =>  {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [lpAllowance, setLpAllowance] = useState(ethers.constants.Zero);
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction] = useState('Supply')
  
  const router = useRouter()
  const { account, chainId } = useWeb3React();
  
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  
  const lendingPoolContract = useLendingPoolContract(vault.address)
  
	const openModal = () => { setVisible(true)}
	const closeModal = () => {setVisible(false)}
  
  const tokenAmounts = useUnderlyingAmount(asset.address, vault)
  const underlyingAsset = useAssetData(tokenAmounts.amount0 > 0 ? vault.token0.address : vault.token1.address, vault.address, oracleAddress)
  const tokenContract = useTokenContract(underlyingAsset.address)
  const opm = useOptionsPositionManager() 
  
  useEffect(() => {
    if (!tokenContract) return;
    // to deposit an ERC20 asset we check allowance
    const checkAllowance = async () => {
      const result = await tokenContract.allowance(account, vault.address)
      setLpAllowance(result)
    }
    try {
      checkAllowance()
    } catch(e){console.log('check allowance dWM', e)}
  }, [account, asset, tokenContract])
  


  const goTxGo = async (action) => {
    try {
      setSpinning(true)
      var result;
      if(action == "Approve"){
        result = await tokenContract.approve(vault.address, ethers.constants.MaxUint256)
      }
      else if (action =="Supply"){
        result = await lendingPoolContract.deposit(asset.address, ethers.utils.parseUnits(inputValue, asset.decimals), account, 0)
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
  
  
  var actionComponent ;
  if (action == 'Supply' ) actionComponent = "Supply "+underlyingAsset.name+" to "+asset.name;
  else if (action =="Withdraw") actionComponent = "Withdraw "+underlyingAsset.name+" from "+asset.name;
  else if (action == "Approve") actionComponent = "Approve "+underlyingAsset.name;

  var assetBal = action == "Withdraw" ? asset.deposited : underlyingAsset.wallet;
  
  const checkSetInputValue = (e) => {
    if ( inputValue && (asset.name != "ETH" || chainId != 1 ) && action == "Supply" && ethers.utils.parseUnits(parseFloat(inputValue).toFixed(asset.decimals), asset.decimals).gt(lpAllowance) )
      setAction("Approve")
    
    setInputValue(e)
  }
  
  return (
    <>
      <Button type="primary" onClick={openModal} size={size ?? 'default'}>
        Deposit / Withdraw
      </Button>
      <Modal open={visible} onOk={closeModal} onCancel={closeModal}
        width={450}
        footer={null}
      >
        <Tabs 
          defaultActiveKey="Supply" 
          centered
          onChange={(activeKey) => {setAction(activeKey)}}
          items={[
            {
              label: (<span style={{ width: '50%' }}><UploadOutlined />Supply to {asset.name}</span>),
              key: 'Supply',
            },
            {
              label: (<span style={{ width: '50%' }}><DownloadOutlined />Withdraw from {asset.name}</span>),
              key: 'Withdraw',
            }
          ]}
         />
         
      <div className="formDiv">
        {contextHolder}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
        <span>Underlying: {underlyingAsset.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(assetBal)}} >Wallet: {assetBal} {action == "Supply" ? underlyingAsset.name : asset.name}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={assetBal} onChange={(e)=> checkSetInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={action == "Supply" ? underlyingAsset.icon : asset.icon} width={18} alt="tokenIcon" />&nbsp;{action == "Supply" ? underlyingAsset.name : asset.name}</>}
        />
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%'}} onClick={() => goTxGo(action)} disabled>
          { isSpinning ? <Spin /> : <>{actionComponent}</> }
        </Button>
      </div>
      </Modal>
    </>
  )
}


export default DepositWithdrawalTickerModal;