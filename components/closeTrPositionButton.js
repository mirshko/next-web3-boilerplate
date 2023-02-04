import { useState } from 'react'
import { Button, notification, Spin } from 'antd'
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import { useWeb3React } from "@web3-react/core";
import {ethers} from 'ethers'
 

const CloseTrPositionButton = ({address, vault, opmAddress}) => {
  const { account } = useWeb3React();
  const [isSpinning, setSpinning] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (type, title, message) => { api[type]({message: title, description: message }); }
  const opm = useOptionsPositionManager(opmAddress) 
  
   const closePosition = async ()  => {
    setSpinning(true)
    try {
      /*
        function close(
          uint poolId, 
          address user,
          address debtAsset, 
          uint repayAmount,  // use 0 to repay all
          address collateralAsset // useless here since no liquidation
        ) */
        console.log(vault.poolId, account, address, 0, ethers.constants.AddressZero)
      let res = await opm.close(vault.poolId, account, address, 0, ethers.constants.AddressZero )
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


export default CloseTrPositionButton;