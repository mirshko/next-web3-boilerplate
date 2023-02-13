import { Fragment, useState, useEffect } from "react";
import { Modal, Button, Tabs, Input, notification, Divider } from "antd";
import { CheckCircleOutlined, HourglassOutlined, LoadingOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useTokenContract from "../hooks/useTokenContract";
import useZapbox from "../hooks/useZapbox";
import useZapboxTR from "../hooks/useZapboxTR";
import useRangeManager from "../hooks/useRangeManager";
import { useWeb3React } from "@web3-react/core";
import useTheme from "../hooks/useTheme"

const DepositWithdrawalModal = ({ vaultAddresses, rangeAddress, token0, token0Amount, token1, token1Amount, isLpV2 }) =>  {
  const [visible, setVisible] = useState(false);
	const openModal = () => { 
    setErrorTx(false)
    setVisible(true)
    setRunningTx(0)
  }
	const closeModal = () => {
    setVisible(false)
    setRunningTx(-1)
  }

  const [lpAllowance0, setLpAllowance0] = useState(ethers.constants.Zero);
  const [lpAllowance1, setLpAllowance1] = useState(ethers.constants.Zero);
  const [runningTx, setRunningTx] = useState(-1)
  const [errorTx, setErrorTx] = useState(false)

  const { account, chainId } = useWeb3React();
  const theme = useTheme();
  
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  
  const lendingPool = vaultAddresses['lendingPools'].length > 0 ?  vaultAddresses['lendingPools'][0] : {}
  const zapboxContract = useZapbox()
  const zapboxTRContract = useZapboxTR()
  const rmContract = useRangeManager(lendingPool.address)
  const destContract = isLpV2 ? zapboxContract : zapboxTRContract
  const lendingPoolContract = useLendingPoolContract(lendingPool.address )
  const token0Contract = useTokenContract(token0.address)
  const token1Contract = useTokenContract(token1.address)
  
  
  useEffect( () => {
    const process = async () => {
      if ( !token0Contract || !token1Contract || !account || !destContract) return;
      try {
        if(runningTx == 0){
          let result = await token0Contract.allowance(account, destContract.address)
          setLpAllowance0(result)
          console.log('allow0', result.toString())
          result = await token1Contract.allowance(account, destContract.address)
          setLpAllowance1(result)
          console.log('allow1', result.toString())
          setRunningTx(1)
        }
        else if(runningTx == 1){
          if (lpAllowance0.lt(token0Amount) ){
            let result = await token0Contract.approve(destContract.address, ethers.constants.MaxUint256)
            openNotification("success", "Tx Sent", "Tx mined")
            setLpAllowance0(ethers.constants.MaxUint256)
          }
          setRunningTx(2)
        }
        else if (runningTx == 2){
          if (lpAllowance1.lt(token1Amount) ){
            let result = await token1Contract.approve(destContract.address, ethers.constants.MaxUint256)
            openNotification("success", "Tx Sent", "Tx mined")
            setLpAllowance1(ethers.constants.MaxUint256)
          }
          setRunningTx(3)
        }
        else if (runningTx == 3) {
          if (isLpV2){
            console.log('v2 liq', lendingPool.poolId, token0.address, token0Amount.toString(), token1.address, token1Amount.toString())
            let result = await zapboxContract.zapIn(lendingPool.poolId, token0.address, token0Amount, token1.address, token1Amount)
          }
          else {
            console.log('v3 liq', zapboxTRContract.address, lendingPool.poolId, rangeAddress, token0Amount.toString(), token1Amount.toString())
            let result = await zapboxTRContract.zapIn(lendingPool.poolId, rangeAddress, token0Amount, token1Amount)
          }
          openNotification("success", "Tx Sent", "Tx mined")
          closeModal()
        }
      }
      catch(e){
        setErrorTx(true); 
        console.log(e.message);
        openNotification("error", e.code, e.message)
      }
    }
    if (runningTx >= 0) process()
  }, [runningTx])

  const GetIcon = ({index}) => {
    if (index == runningTx) return (errorTx ? <ExclamationCircleOutlined  style={{float: 'right', color: theme.colorError}} /> : <LoadingOutlined style={{float: 'right'}} />)
    if (index < runningTx) return <CheckCircleOutlined style={{color: theme.colorSuccess, float: 'right'}} />
    if (index > runningTx) return <HourglassOutlined style={{color: theme.colorWarning, float: 'right'}} />
  }
  
  return (
    <>
      <Button type="primary" onClick={openModal} size={'default'} disabled={token0Amount == 0 && token1Amount==0}>
        Farm
      </Button>
      <Modal open={visible} onOk={closeModal} onCancel={closeModal}
        width={500}
        footer={null}
        title="Deposit & Farm"
      >
      {contextHolder}
        <div style={{margin: 20, marginTop: 40}}>
          <div>
            Approve {token0.name}
            <GetIcon index={1} />
          </div>
          <Divider  style={{margin: '8px 0'}} />
          <div>
            Approve {token1.name}
            <GetIcon index={2} />
          </div>
          <Divider style={{margin: '8px 0'}} />
          <div>
            Deposit
            <GetIcon index={3} />
          </div>
          
        </div>
      </Modal>
    </>
  )
}

export default DepositWithdrawalModal;