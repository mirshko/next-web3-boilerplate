import { useState } from "react";
import { Button, Spin } from "antd";
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useTxNotification } from "../hooks/useTxNotification";

const CloseTrPositionButton = ({ address, vault, opmAddress, checkPositions, direction }) => {
  const { account } = useWeb3React();
  const [isSpinning, setSpinning] = useState(false);
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();
  const opm = useOptionsPositionManager(opmAddress);

  const closePosition = async () => {
    setSpinning(true);
    try {
      /*
        function close(
          uint poolId, 
          address user,
          address debtAsset, 
          uint repayAmount,  // use 0 to repay all
          address collateralAsset // useless here since no liquidation
        ) */
      console.log(
        vault.poolId,
        account,
        address,
        0,
        vault.token0.address
      );
      const { hash } = await opm.close(
        vault.poolId,
        account,
        address,
        0,
        direction == "Long" ? vault.token1.address : vault.token0.address
      );
      
      let positionsData = JSON.parse(localStorage.getItem("GEpositions") ?? '{}' );
      if (positionsData[account]["opened"][address]) {
        let p = positionsData[account]["opened"][address]
        delete positionsData[account]["opened"][address]
        p.close = new Date();
        positionsData[account]["closed"].push(p)
      }
      localStorage.setItem("GEpositions", '{}' );
      
      showSuccessNotification(
        "Position closed",
        "Position closed successful",
        hash
      );
      await new Promise(resolve => setTimeout(resolve, 3000)); // artificial waiting time for server to process event
      checkPositions();
    } catch (e) {
      console.log("Error closing position", e);
      showErrorNotification(e.code, e.reason);
    }
    setSpinning(false);
  };

  return (
    <>
      {contextHolder}
      {isSpinning ? (
        <Spin />
      ) : (
        <Button size="small" onClick={closePosition}>
          Close
        </Button>
      )}
    </>
  );
};

export default CloseTrPositionButton;
