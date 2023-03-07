import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, notification, Divider, Row, Col, Checkbox } from "antd";
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, HourglassOutlined, LoadingOutlined, ExclamationCircleOutlined, ForkOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useZapboxTR from "../hooks/useZapboxTR";
import useUnderlyingAmount from "../hooks/useUnderlyingAmount";
import useTokenContract from "../hooks/useTokenContract";
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import useAssetData from "../hooks/useAssetData";
import { useWeb3React } from "@web3-react/core";
import useTheme from "../hooks/useTheme"
import useETHBalance from '../hooks/useETHBalance'


const DepositWithdrawalTickerModal = ({asset, vault, size, oracleAddress, isVisible, setVisible}) =>  {
  const [inputValue, setInputValue] = useState("0");
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction] = useState('Supply')
  const [runningTx, setRunningTx] = useState(0)
  const [errorTx, setErrorTx] = useState(false)
  const [useEth, setUseEth] = useState(false)
  
  const theme = useTheme()
  const router = useRouter()
  const { account, chainId } = useWeb3React();
  const ethBalance = useETHBalance(account).data / 1e18
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const openModal = () => {setVisible(true)}
	const closeModal = () => {setRunningTx(0); setVisible(false)}
  
  const lendingPoolContract = useLendingPoolContract(vault.address)
  const zapboxTRContract = useZapboxTR()
  const { tokenAmounts, tokenAmountsExcludingFees, totalSupply } = useUnderlyingAmount(asset.address, vault)
  const underlyingAsset = useAssetData(tokenAmountsExcludingFees.amount0 > 0 ? vault.token0.address : vault.token1.address, vault.address, oracleAddress)
  const otherAsset = useAssetData(tokenAmountsExcludingFees.amount0 > 0 ? vault.token1.address : vault.token0.address, vault.address, oracleAddress)
  const assetContract = useTokenContract(asset.address)
  const roeAssetContract = useTokenContract(asset.roeAddress)
  const tokenContract = useTokenContract(underlyingAsset.address)

  const upperAsset = vault.name.split('-')[0] == underlyingAsset.name ? otherAsset : underlyingAsset
  const lowerAsset = vault.name.split('-')[0] == underlyingAsset.name ? underlyingAsset : otherAsset
  const apr24h = ( parseFloat(asset.feeApr) + parseFloat(asset.supplyApr) ) / 365

  
  const goTxGo = async (action) => {
    setRunningTx(1)
    setSpinning(true)
    setErrorTx(false)
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    try {
      if (action =="Supply"){
        if (useEth){
          setRunningTx(2)
          console.log(vault.poolId,
            asset.address,
            otherAsset.address,
            0,
            { value:  ethers.utils.parseUnits(inputValue, 18) })
          let result = await zapboxTRContract.zapInETH(
            vault.poolId,
            asset.address,
            otherAsset.address,
            0,
            { value:  ethers.utils.parseUnits(inputValue, 18) }
          )
        }
        else {
          let result = await tokenContract.allowance(account, zapboxTRContract.address)
          if ( result.lt(ethers.utils.parseUnits(inputValue, underlyingAsset.decimals)) ){
            setRunningTx(1)
            result = await tokenContract.approve(zapboxTRContract.address, ethers.constants.MaxUint256)
            await delay(5000)
          }
          setRunningTx(2)
          console.log( vault.poolId, 
            asset.address, 
            tokenAmountsExcludingFees.amount0 > 0 ? ethers.utils.parseUnits(inputValue, vault.token0.decimals) : 0,
            tokenAmountsExcludingFees.amount1 > 0 ? ethers.utils.parseUnits(inputValue, vault.token1.decimals).toString() : 0, )
          result = await zapboxTRContract.zapIn(
            vault.poolId, 
            asset.address, 
            tokenAmountsExcludingFees.amount0 > 0 ? ethers.utils.parseUnits(inputValue, vault.token0.decimals) : 0,
            tokenAmountsExcludingFees.amount1 > 0 ? ethers.utils.parseUnits(inputValue, vault.token1.decimals) : 0,
          )
        }
        openNotification("success", "Tx Mined", "Assets Successfully Deposited")
        setRunningTx(3)
        //closeModal()
      }
      else if (action == "Withdraw") {    
        let result = await roeAssetContract.allowance(account, zapboxTRContract.address)

        if ( result.lt(ethers.utils.parseUnits(inputValue, await roeAssetContract.decimals())) ){
          setRunningTx(1)
          result = await roeAssetContract.approve(zapboxTRContract.address, ethers.constants.MaxUint256)
          await delay(5000)
        }
        setRunningTx(2)
        result = await zapboxTRContract.zapOut(
          vault.poolId, 
          asset.address, 
          ethers.utils.parseUnits(inputValue, asset.decimals),
          useEth,
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
  if (action == 'Supply' ) actionComponent = "Supply "+(useEth && underlyingAsset.name == 'WETH' ? 'ETH': underlyingAsset.name)+" to "+asset.name;
  else if (action =="Withdraw") actionComponent = "Withdraw "+(useEth ? 'ETH' : underlyingAsset.name)+" from "+asset.name;
  var assetBal = action == "Withdraw" ? asset.deposited : underlyingAsset.wallet;
  
  
  const GetIcon = ({index}) => {
    if (index == runningTx) return (errorTx ? <ExclamationCircleOutlined  style={{float: 'right', color: theme.colorError}} /> : <LoadingOutlined style={{float: 'right'}} />)
    if (index < runningTx) return <CheckCircleOutlined style={{color: theme.colorSuccess, float: 'right'}} />
    if (index > runningTx) return <HourglassOutlined style={{color: theme.colorWarning, float: 'right'}} />
  }
  
  
  return (
    <>
      <Modal open={isVisible} onOk={closeModal} onCancel={closeModal}
        width={550}
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
        
        <div style={{ border: '1px solid rgba(200,200,200,0.1)', margin: '12px 0px', borderRadius: 2}}>
          <Row>
            <Col span={6} >
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center', paddingLeft: 32}}>
                <span style={{ fontSize: 16  }}>Entry: {asset.price}</span>
                <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>Hold 24 hours</span>
              </div>
            </Col>
            <Col span={18}>
              <div style={{ height: '100%'}}>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <RiseOutlined style={{fontSize: 24, marginRight: 16, marginBottom: -32}} />
                  <img src={ upperAsset.icon } height={32} width={32} alt='Quote Asset' />
                  <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', width: 130}} >
                    <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>Receive</span>
                    {(asset.price * (100+apr24h) / 100).toFixed(4)} {upperAsset.name}
                  </div>
                  <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column'}} >
                    <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>Profit</span>
                    {(asset.price * (apr24h) / 100).toFixed(4)} {upperAsset.name}
                  </div>
                </div>
                <Divider style={{margin: 0, marginLeft: 48, minWidth: '80%', width: '85%'}} />
                <div style={{ padding: 16, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <FallOutlined style={{fontSize: 24, marginRight: 16, marginTop: -32}} />
                  <img src={lowerAsset.icon} height={32} width={32}  alt='Base Asset'/>
                  <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', width: 130}} >
                    <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>Receive</span>
                    {(1 * (100+apr24h) / 100 ).toFixed(4)} {lowerAsset.name }
                  </div>
                  <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column'}} >
                    <span style={{ fontSize: 'smaller', fontWeight: 'bold'}}>Profit</span>
                    {(1 * (apr24h) / 100 ).toFixed(4)} {lowerAsset.name}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span>Amount</span>
          <span style={{ cursor: "pointer"}} onClick={()=>{setInputValue(assetBal)}} >Wallet: {parseFloat(useEth&&action=="Supply"? ethBalance : assetBal).toFixed(5)} {action == "Supply" ? (useEth && underlyingAsset.name == 'WETH' ? 'ETH': underlyingAsset.name) : asset.name}</span>
        </div>
        <Input type="number" style={{ width: '100%', marginBottom: 20}} min={0} max={assetBal} onChange={(e)=> setInputValue(e.target.value)} 
          key='inputamount'
          value={inputValue}
          suffix={<><img src={action == "Supply" ? underlyingAsset.icon : asset.icon} width={18} alt="tokenIcon" />&nbsp;{action == "Supply" ? (useEth && underlyingAsset.name == 'WETH' ? 'ETH': underlyingAsset.name) : asset.name}</>}
        />
        
        { action == 'Withdraw' ?
          <div style={{marginBottom: 12}}>Underlying: {inputValue * (tokenAmounts.amount0 > 0 ? tokenAmounts.amount0 : tokenAmounts.amount1) * 1e18 / totalSupply } {underlyingAsset.name}</div>
          : null
        }
        
        { underlyingAsset.name == 'WETH' ? <Checkbox onChange={()=>{ setUseEth(!useEth)}} checked={!useEth} >Use Wrapped ETH</Checkbox> : null }
        
        <Button type={isSpinning ? "default":"primary"} style={{width: '100%', marginTop: 12}} onClick={() => goTxGo(action)} disabled={isSpinning}>
          { isSpinning ? <Spin /> : <>{actionComponent}</> }
        </Button>
        
        { runningTx > 0 ? <><Divider orientation="left">Execute</Divider>
          <div style={{ display: (useEth&&action=='Supply'? 'none' : 'block' )}}>
            Approve
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