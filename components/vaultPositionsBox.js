import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Checkbox,
  Button,
  Popover,
  Divider,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import useAddresses from "../hooks/useAddresses";
import useAssetData from "../hooks/useAssetData";
import DepositWithdrawalModal from "./depositWithdrawalModal";
import DepositWithdrawalTickerModal from "./depositWithdrawalTickerModal";
import CloseDebt from "./closeDebt";
import CloseTrPositionButton from "./closeTrPositionButton";
import { ethers } from "ethers";

/**
  Displays user positions in a vault
  That includes:
    - single assets
    - LPv2 positions (whether supply or debt)
    - Rangers (supply or debt)
*/
const VaultPositionsBox = ({ assetAddress, vault, hideEmpty }) => {
  const [assets, setAssets] = useState([]);
  const ADDRESSES = useAddresses();
  const asset = useAssetData(assetAddress, vault.address);
  const [isModalVisible, setModalVisible] = useState();
  const [highlightBox, setHighlightBox] = useState(false);

  if (hideEmpty && asset.deposited == 0 && asset.debt == 0) return <></>;

  const toReadable = (value) => {
    if (value == 0) return 0;
    if (value < 10) return parseFloat(value).toFixed(2);
    if (value < 1000) return parseFloat(value).toFixed(0);
    if (value < 1e6) return (value / 1000).toFixed(0) + "k";
    if (value < 1e9) return (value / 1000).toFixed(0) + "M";
  };

  return (
    <Col
      md={6}
      xs={24}
      style={{ marginBottom: 24, cursor: "pointer" }}
      onMouseOver={() => {
        setHighlightBox(true);
      }}
      onMouseOut={() => {
        setHighlightBox(false);
      }}
    >
      {asset.type == "ticker" ? (
        <DepositWithdrawalTickerModal
          asset={asset}
          vault={vault}
          opmAddress={ADDRESSES["optionsPositionManager"]}
          setVisible={setModalVisible}
          isVisible={isModalVisible}
        />
      ) : null}
      {asset.type == "single" ? (
        <DepositWithdrawalModal
          asset={asset}
          vault={vault}
          setVisible={setModalVisible}
          isVisible={isModalVisible}
        />
      ) : null}
      <Card
        onClick={() => {
          setModalVisible(true);
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 0,
        }}
        style={{ borderRadius: 18, maxWidth: 260, borderWidth: 10 }}
      >
        <div
          style={{
            padding: 24,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              borderRadius: 25,
            }}
          >
            <img src={asset.icon} height={20} alt={asset.name.toLowerCase()} />
            <span
              style={{ fontSize: "larger", fontWeight: "bold", marginLeft: 8 }}
            >
              {asset.name == "WETH" ? "ETH" : asset.name}
            </span>
          </div>

          <Popover
            placement="right"
            title="APR"
            content={
              <div style={{ width: 200 }}>
                Borrowing Fees:{" "}
                <span style={{ float: "right" }}>{asset.supplyApr} %</span>
                <br />
                Token Incentives: <span style={{ float: "right" }}>0.00 %</span>
                <br />
                {asset.feeApr > 0 ? (
                  <>
                    V3 Fees:{" "}
                    <span style={{ float: "right" }}>{asset.feeApr} %</span>
                  </>
                ) : null}
              </div>
            }
          >
            <div
              style={{
                width: "100%",
                backgroundColor: "#444",
                display: "flex",
                justifyContent: "center",
                padding: 8,
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: "large", marginRight: 8 }}>
                APR{" "}
                {(
                  parseFloat(asset.supplyApr) + parseFloat(asset.feeApr)
                ).toFixed(2)}{" "}
                %
              </span>
              <QuestionCircleOutlined />
            </div>
          </Popover>

          <img src={asset.icon} height={56} alt={asset.name.toLowerCase()} />

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 64,
              }}
            >
              <span
                style={{
                  fontSize: "smaller",
                  fontWeight: "bold",
                  color: "grey",
                }}
              >
                TVL
              </span>
              ${asset.tvl == 0 ? <>0</> : toReadable(asset.tvl)}
            </div>
            <Divider type="vertical" style={{ height: 28, marginTop: 6 }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 64,
              }}
            >
              <span
                style={{
                  fontSize: "smaller",
                  fontWeight: "bold",
                  color: "grey",
                }}
              >
                My Assets
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {asset.type == "single" ? (
                  <img src={asset.icon} height={12} alt={asset.name} />
                ) : (
                  <>$</>
                )}
                {toReadable(
                  asset.type == "single"
                    ? asset.deposited
                    : asset.depositedValue
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              borderRadius: 25,
              transform: "rotate(180deg)",
            }}
          ></div>
        </div>
      </Card>
    </Col>
  );
};

export default VaultPositionsBox;
