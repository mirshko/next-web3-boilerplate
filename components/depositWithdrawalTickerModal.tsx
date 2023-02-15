import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, notification, Divider } from "antd";
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, HourglassOutlined, LoadingOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useZapboxTR from "../hooks/useZapboxTR";
import useUnderlyingAmount from "../hooks/useUnderlyingAmount";
import useTokenContract from "../hooks/useTokenContract";
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import useAssetData from "../hooks/useAssetData";
import { useWeb3React } from "@web3-react/core";
import useTheme from "../hooks/useTheme"


const DepositWithdrawalTickerModal = ({asset, vault, size, oracleAddress}) =>  {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction] = useState('Supply')
  const [runningTx, setRunningTx] = useState(0)
  const [errorTx, setErrorTx] = useState(false)
  
  const theme = useTheme()
  const router = useRouter()
  const { account, chainId } = useWeb3React();
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const openModal = () => {setRunningTx(0); setVisible(true)}
	const closeModal = () => {setVisible(false)}
  
  const lendingPoolContract = useLendingPoolContract(vault.address)
  const zapboxTRContract = useZapboxTR()
  const tokenAmounts = useUnderlyingAmount(asset.address, vault)
  const underlyingAsset = useAssetData(tokenAmounts.amount0 > 0 ? vault.token0.address : vault.token1.address, vault.address, oracleAddress)
  const assetContract = useTokenContract(asset.address)
  const roeAssetContract = useTokenContract(asset.roeAddress)
  const tokenContract = useTokenContract(underlyingAsset.address)


  const goTxGo = async (action) => {
    setRunningTx(1)
    setSpinning(true)
    setErrorTx(false)

    try {
      if (action =="Supply"){
        let result = await tokenContract.allowance(account, zapboxTRContract.address)
        if ( result.lt(ethers.utils.parseUnits(inputValue, underlyingAsset.decimals)) ){
          setRunningTx(1)
          result = await tokenContract.approve(zapboxTRContract.address, ethers.constants.MaxUint256)
        }
        setRunningTx(2)
        console.log( vault.poolId, 
          asset.address, 
          tokenAmounts.amount0 > 0 ? ethers.utils.parseUnits(inputValue, vault.token0.decimals) : 0,
          tokenAmounts.amount1 > 0 ? ethers.utils.parseUnits(inputValue, vault.token1.decimals) : 0, )
        result = await zapboxTRContract.zapIn(
          vault.poolId, 
          asset.address, 
          tokenAmounts.amount0 > 0 ? ethers.utils.parseUnits(inputValue, vault.token0.decimals) : 0,
          tokenAmounts.amount1 > 0 ? ethers.utils.parseUnits(inputValue, vault.token1.decimals) : 0,
        )
        openNotification("success", "Tx Mined", "Assets Successfully Deposited")
        setRunningTx(3)
        //closeModal()
      }
      else if (action == "Withdraw") {    
        let result = await roeAssetContract.allowance(account, zapboxTRContract.address)
        console.log(result, ethers.utils.parseUnits(inputValue, await roeAssetContract.decimals()), result.lt(ethers.utils.parseUnits(inputValue, await roeAssetContract.decimals())) )
        if ( result.lt(ethers.utils.parseUnits(inputValue, await roeAssetContract.decimals())) ){
          setRunningTx(1)
          result = await roeAssetContract.approve(zapboxTRContract.address, ethers.constants.MaxUint256)
        }
        setRunningTx(2)
        result = await zapboxTRContract.zapOut(
          vault.poolId, 
          asset.address, 
          ethers.utils.parseUnits(inputValue, asset.decimals)
        )
        openNotification("success", "Tx Mined", "Assets Successfully Withdrawn")
        setRunningTx(3)
        //closeModal()
      }
    }
    catch(e){
      setErrorTx(true); 
      console.log(e.message);
      openNotification("error", e.code, e.message)
    }
    setInputValue(0)
    setSpinning(false);
  }
  
  
  var actionComponent ;
  if (action == 'Supply' ) actionComponent = "Supply "+underlyingAsset.name+" to "+asset.name;
  else if (action =="Withdraw") actionComponent = "Withdraw "+underlyingAsset.name+" from "+asset.name;
  var assetBal = action == "Withdraw" ? asset.deposited : underlyingAsset.wallet;
  
  
  const GetIcon = ({index}) => {
    if (index == runningTx) return (errorTx ? <ExclamationCircleOutlined  style={{float: 'right', color: theme.colorError}} /> : <LoadingOutlined style={{float: 'right'}} />)
    if (index < runningTx) return <CheckCircleOutlined style={{color: theme.colorSuccess, float: 'right'}} />
    if (index > runningTx) return <HourglassOutlined style={{color: theme.colorWarning, float: 'right'}} />
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
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(assetBal)}} >Wallet: {assetBal} {action == "Supply" ? underlyingAsset.name : asset.name}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={assetBal} onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={action == "Supply" ? underlyingAsset.icon : asset.icon} width={18} alt="tokenIcon" />&nbsp;{action == "Supply" ? underlyingAsset.name : asset.name}</>}
        />
        
        { action == 'Withdraw' ?
          <>Underlying: {inputValue * (tokenAmounts.amount0 > 0 ? tokenAmounts.amount0 : tokenAmounts.amount1)} {underlyingAsset.name}</>
          : null
        }
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%', marginTop: 12}} onClick={() => goTxGo(action)}>
          { isSpinning ? <Spin /> : <>{actionComponent}</> }
        </Button>
        
        { runningTx > 0 ? <><Divider orientation="left">Execute</Divider>
          <div>
            Approve Zap contract
            <GetIcon index={1} />
          </div>
          <div>
          {action}
            <GetIcon index={2} />
          </div>
          </>
          : null 
        }
      </div>
      </Modal>
    </>
  )
}


export default DepositWithdrawalTickerModal;