import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, notification, Checkbox, Divider } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useTokenContract from "../hooks/useTokenContract";
import useETHBalance from '../hooks/useETHBalance'
import useWethGateway from '../hooks/useWethGateway'
import { useWeb3React } from "@web3-react/core";
import TxIcon from './txIcon'

const DepositWithdrawalModal = ({asset, lendingPool, size}) =>  {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [lpAllowance, setLpAllowance] = useState(ethers.constants.Zero);
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction] = useState('Supply')
  const [runningTx, setRunningTx] = useState(0)
  const [errorTx, setErrorTx] = useState(false)
  const [useEth, setUseEth] = useState(false)
  const [approveWhat, setApproveWhat] = useState()
  
  const router = useRouter()
  const { account, chainId } = useWeb3React();
  const ethBalance = useETHBalance(account).data / 1e18
  
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  
  const lendingPoolContract = useLendingPoolContract(lendingPool.address )
  const tokenContract = useTokenContract(asset.address)
  const roeTokenContract = useTokenContract(asset.roeAddress)
  const wethGateway = useWethGateway()
  
  const openModal = () => {setRunningTx(0); setVisible(true)}
	const closeModal = () => {setVisible(false)}
  
  var nativeToken = false;
  if ( asset.name == 'ETH' && (chainId == 1 || chainId == 42161 )) nativeToken = true;
  if (asset.name == 'MATIC' && (chainId == 137 || chainId == 1337) ) nativeToken = true;
  


  const goTxGo = async (action) => {
    setRunningTx(1)
    setSpinning(true)
    setErrorTx(false)
    try {
      if (action =="Supply"){
        if (useEth){
          let result = await wethGateway.depositETH(lendingPool.address, account, 0, {value: ethers.utils.parseUnits(inputValue, 18)})
        } 
        else {
          setApproveWhat('the lending pool')
          let result = await tokenContract.allowance(account, lendingPool.address)
          if ( result.lt(ethers.utils.parseUnits(inputValue, asset.decimals)) ){
            setRunningTx(1)
            result = await tokenContract.approve(lendingPool.address, ethers.constants.MaxUint256)
          }
          setRunningTx(2)
          result = await lendingPoolContract.deposit(asset.address, ethers.utils.parseUnits(inputValue, asset.decimals), account, 0)
        }
        openNotification("success", "Tx Mined", "Assets Successfully Deposited")
        setRunningTx(3)
        //closeModal()
      }
      else if (action == "Withdraw") {
        if (useEth){
          // give aWETH allowance to wethGateway
          setApproveWhat('the WETH gateway')
          let result = await roeTokenContract.allowance(account, wethGateway.address)
          if ( result.lt(ethers.utils.parseUnits(inputValue, asset.decimals)) ){
            setRunningTx(1)
            result = await roeTokenContract.approve(wethGateway.address, ethers.constants.MaxUint256)
          }
          setRunningTx(2)
          wethGateway.withdrawETH(lendingPool.address, ethers.utils.parseUnits(inputValue, asset.decimals), account)
        }
        else {
          let result = await lendingPoolContract.withdraw(asset.address, ethers.utils.parseUnits(inputValue, asset.decimals), account)
        }
        openNotification("success", "Tx Sent", "Tx mined")
        setRunningTx(3)
        //closeModal()
      }
    }
    catch(e){
      console.log(e.message);
      openNotification("error", e.code, e.message)
    }
    setSpinning(false);
  }

  var actionComponent = action+" "+(useEth && asset.name == 'WETH' ? 'ETH' : asset.name );
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
          onChange={(activeKey) => {setRunningTx(0); setAction(activeKey)}}
          items={[
            {
              label: (<span style={{ width: '50%' }}><UploadOutlined />Supply {useEth ? 'ETH' : asset.name}</span>),
              key: 'Supply',
            },
            {
              label: (<span style={{ width: '50%' }}><DownloadOutlined />Withdraw {useEth ? 'ETH' : asset.name}</span>),
              key: 'Withdraw',
            }
          ]}
         />
         
      <div className="formDiv">
        {contextHolder}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(assetBal)}} >{ action == 'Supply' ? 'Wallet':'Available'}: {useEth && action == 'Supply' ? parseFloat(ethBalance).toFixed(5) : parseFloat(assetBal).toFixed(5)}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={assetBal} onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={asset.icon} width={18} alt="tokenIcon" />&nbsp;{useEth ? 'ETH' : asset.name}</>}
        />
        { asset.name == 'WETH' ? <Checkbox onChange={()=>{ setUseEth(!useEth)}} checked={!useEth} >Use Wrapped ETH</Checkbox> : null }
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%', marginTop: 16}} onClick={() => goTxGo(action)} >
          { isSpinning ? <Spin /> : <>{actionComponent}</> }
        </Button>
        
        { runningTx > 0 ? <><Divider orientation="left">Execute</Divider>
          <div style={{ display: ( (useEth && action == 'Supply') || (!useEth && action == 'Withdraw') ? 'none' : 'block' )}}>
            Allow {approveWhat}
            <TxIcon index={1} runningTx={runningTx} errorTx={errorTx} />
          </div>
          <div>
          {action}
            <TxIcon index={2} runningTx={runningTx} errorTx={errorTx} />
          </div>
          </>
          : null 
        }
        
      </div>
      </Modal>
    </>
  )
}


export default DepositWithdrawalModal;