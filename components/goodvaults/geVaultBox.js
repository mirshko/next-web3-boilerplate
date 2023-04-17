import { useState } from "react";
import { Card, Col, Popover, Divider } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';
import useGeVault from "../../hooks/useGeVault";
import useAssetData from "../../hooks/useAssetData";
import useTheme from "../../hooks/useTheme";


const GeVaultBox = ({ vault }) => {
  const [highlightBox, setHighlightBox] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const asset = useGeVault(vault);
  const mainAsset = useAssetData(vault ? vault.token0.address: null, vault.address)
  
  const toReadable = (value) => {
    if (value == 0) return 0;
    if (value < 10) return parseFloat(value).toFixed(2);
    if (value < 1000) return parseFloat(value).toFixed(0);
    if (value < 1e6) return (value / 1000).toFixed(0) + "k";
    if (value < 1e9) return (value / 1000).toFixed(0) + "M";
  };
  
  if (!vault.geVault) return <></>  
  
  const RewardsTag = () => {
    return (<div style={{backgroundColor: "#0A371B", color: theme.colorPrimary, borderRadius: 4, padding: "6px 8px", display: 'flex', alignItems: 'center', fontWeight: 600 }}>
      <img src="/logo.svg" height={18} alt='Good Entry Logo' style={{ marginRight:4 }} />
      Rewards
    </div>)
  }

  
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
        style= {{}}
        bodyStyle= {{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between", height: '100%', gap: 12, 
          boxShadow: (highlightBox ? "0px 0px 30px rgba(15, 253, 106, 0.4)" : "" ) ,
          border: (highlightBox ? "1px solid #0FFD6A" : "")
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          <RewardsTag />
        </div>
        <img src={mainAsset.icon} height={164} alt={asset.name.toLowerCase()} />
        <span
          style={{ fontSize: "x-large", marginLeft: 8 }}
        >
          {asset.name == "WETH-USDC" ? "ETH-USDC" : asset.name}
        </span>
        
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center'
          }}
        >
            <span
              style={{
                fontWeight: "bold",
                color: "grey",
              }}
            >
              Projected APR{" "}
              <Popover
                placement="right"
                title="APR"
                content={
                  <div style={{ width: 250 }}>
                    Trading Fees:{" "}
                    <span style={{ float: "right" }}>{parseFloat(asset.supplyApr).toFixed(2)} %</span>
                    <br />
                    V3 Fees (7d annualized):{" "}
                    <span style={{ float: "right" }}>{parseFloat(asset.feeApr).toFixed(2)} %</span>
                    <br />
                    Token Incentives: <span style={{ float: "right" }}>0.00 %</span>
                  </div>
                }
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span style={{ fontSize: "large" }}>
              {(parseFloat(asset.totalApr)).toFixed(2)} %
            </span>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
            <span
              style={{
                fontWeight: "bold",
                color: "grey",
              }}
            >
              TVL
            </span>
            <span style={{ fontSize: "large" }}>
              ${asset.tvl == 0 ? <>0</> : toReadable(asset.tvl)}
            </span>
        </div>


        <Divider style={{margin: "12px 0"}} />
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
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
            <span style={{ fontSize: "large" }}>
              ${toReadable(asset.walletValue)}
            </span>
          </div>
        </div>
      </Card>
    </Col>
  )
}
  
export default GeVaultBox;