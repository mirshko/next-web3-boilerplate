import { useState } from "react";
import { Button, Spin } from "antd";
import useLonggPositionManager from "../hooks/useLonggPositionManager";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useTxNotification } from "../hooks/useTxNotification";

const CloseLonggPositionButton = ({ address, vault }) => {
  const { account } = useWeb3React();
  const [isSpinning, setSpinning] = useState(false);
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();
  const lpm = useLonggPositionManager();

  const closePosition = async () => {
    setSpinning(true);
    try {
      /*
        function close(
          uint poolId,
          address debtAsset, 
          uint repayAmount, 
          address remainingAsset
        ) */
      console.log(
        vault.poolId,
        account,
        address,
        0,
        ethers.constants.AddressZero
      );
      const { hash } = await lpm.close(
        vault.poolId,
        address,
        0,
        ethers.constants.AddressZero
      );

      console.log("closedPos", res);

      showSuccessNotification(
        "Position closed",
        "Position closed successful",
        hash
      );
    } catch (e) {
      console.log("Error closing position", e.message);
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

export default CloseLonggPositionButton;
