import { useState } from "react";
import { Modal, Button, Input, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useAddresses from "../hooks/useAddresses";
import useRangerPositionManager from "../hooks/useRangerPositionManager";
import { useWeb3React } from "@web3-react/core";
import { useTxNotification } from "../hooks/useTxNotification";

const RedeemRangeModal = ({ listId, asset, target }) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [isSpinning, setSpinning] = useState(false);

  const { account } = useWeb3React();
  const rangerPM = useRangerPositionManager();

  const openModal = () => {
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
  };
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();

  const withdraw = async () => {
    try {
      setSpinning(true);
      const POOL_ID = 0;
      console.log(
        "rpm",
        POOL_ID,
        account,
        asset.address,
        ethers.utils.parseUnits(inputValue, 18)
      );
      const { hash } = await rangerPM.closeRange(
        POOL_ID,
        account,
        asset.address,
        ethers.utils.parseUnits(inputValue, 18)
      );

      showSuccessNotification(
        "Position closed",
        "Position closed successful",
        hash
      );
    } catch (e) {
      console.log(e);
      showErrorNotification(e.code, e.message);
    }
    setSpinning(false);
  };

  const toFixed = (num, dec) => {
    return num ? parseFloat(num).toFixed(dec) : "0";
  };

  return (
    <>
      <Button type="primary" onClick={openModal}>
        Withdraw
      </Button>
      <Modal
        open={visible}
        onOk={closeModal}
        onCancel={closeModal}
        width={400}
        footer={null}
        title="Reduce position"
      >
        <div className="formDiv">
          {contextHolder}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span>Amount</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setInputValue(asset.deposited);
              }}
            >
              Wallet: {toFixed(asset.deposited, 2)}
            </span>
          </div>
          <Input
            type="number"
            style={{ width: "100%", marginBottom: 20 }}
            min={0}
            max={asset.deposited}
            onChange={(e) => setInputValue(e.target.value)}
            key="inputamount"
            value={inputValue}
          />

          <Button
            type={isSpinning ? "" : "primary"}
            style={{ width: "100%" }}
            onClick={() => withdraw()}
          >
            {isSpinning ? (
              <Spin />
            ) : (
              <>
                <DownloadOutlined />
                Withdraw
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default RedeemRangeModal;
