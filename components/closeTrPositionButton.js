import { useState } from "react";
import { Button, Spin } from "antd";
import useOptionsPositionManager from "../hooks/useOptionsPositionManager";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useTxNotification } from "../hooks/useTxNotification";

const CloseTrPositionButton = ({ address, vault, opmAddress }) => {
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
        ethers.constants.AddressZero
      );
      const { hash } = await opm.close(
        vault.poolId,
        account,
        address,
        0,
        ethers.constants.AddressZero
      );

      showSuccessNotification(
        "Position closed",
        "Position closed successful",
        hash
      );
    } catch (e) {
      console.log("Error closing position", e);
      showErrorNotification(e.code, e.message);
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
