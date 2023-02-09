import { useState } from 'react'
import { Button, notification, Spin } from 'antd'
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import { useWeb3React } from "@web3-react/core";
import {ethers} from 'ethers'
 

const CloseLonggPositionButton = ({address, vault}) => {
  const { account } = useWeb3React();
  const [isSpinning, setSpinning] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const lpm = useLonggPositionManager() 
  
   const closePosition = async ()  => {
    setSpinning(true)
    try {
      /*
        function close(
          uint poolId,
          address debtAsset, 
          uint repayAmount, 
          address remainingAsset
        ) */
        console.log(vault.poolId, account, address, 0, ethers.constants.AddressZero)
      let res = await lpm.close(vault.poolId, address, 0, ethers.constants.AddressZero )
      console.log('closedPos', res)
      openNotification("success", "Tx Sent", "Tx mined")
    }
    catch(e){
      console.log('Error closing position', e.message)
      openNotification("error", e.code, e.message)
    }
    setSpinning(false)
  }
  
  return (
    <>
      {contextHolder}
      { isSpinning ? <Spin /> : <Button size="small" onClick={closePosition}>Close</Button> }
    </>
  )

}


export default CloseLonggPositionButton;