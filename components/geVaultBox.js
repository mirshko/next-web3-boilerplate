import { useState } from "react";
import { Card, Col, Popover, Divider } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';
import useGeVault from "../hooks/useGeVault";

const GeVaultBox = ({ vault }) => {
  const [highlightBox, setHighlightBox] = useState(false);
  const router = useRouter();
  const gevault = useGeVault(vault);
  const asset = gevault
  
  const toReadable = (value) => {
    if (value == 0) return 0;
    if (value < 10) return parseFloat(value).toFixed(2);
    if (value < 1000) return parseFloat(value).toFixed(0);
    if (value < 1e6) return (value / 1000).toFixed(0) + "k";
    if (value < 1e9) return (value / 1000).toFixed(0) + "M";
  };
  
  if (!vault.geVault) return <></>  
  console.log(asset)
  
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
      onClick={()=>{router.push("/vaults/"+vault.name)}}
    >
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
              {asset.name == "WETH-USDC" ? "ETH-USDC" : asset.name}
            </span>
          </div>

          <Popover
            placement="right"
            title="APR"
            content={
              <div style={{ width: 250 }}>
                Trading Fees:{" "}
                <span style={{ float: "right" }}>{asset.supplyApr} %</span>
                <br />
                Token Incentives: <span style={{ float: "right" }}>0.00 %</span>
                <br />
                {asset.feeApr > 0 ? (
                  <>
                    V3 Fees (24h annualized):{" "}
                    <span style={{ float: "right" }}>{parseFloat(asset.feeApr).toFixed(2)} %</span>
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
                  parseFloat(asset.totalApr)
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
                ${toReadable(asset.walletValue)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  )
}
  
export default GeVaultBox;