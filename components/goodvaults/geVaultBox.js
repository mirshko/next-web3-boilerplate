import { useState } from "react";
import { Card, Col, Popover, Divider } from "antd";
import { QuestionCircleOutlined, WarningOutlined } from "@ant-design/icons";
import Slider from "../design/slider";
import { useRouter } from 'next/router';
import useGeVault from "../../hooks/useGeVault";
import useAssetData from "../../hooks/useAssetData";
import useTheme from "../../hooks/useTheme";

const GeVaultBox = ({vault, gevault}) => {
  const [highlightBox, setHighlightBox] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const gevaultDetails = useGeVault(vault, gevault);
  const mainAsset = useAssetData(vault ? vault.token0.address: null, vault.address)
  
  const toReadable = (value) => {
    if (value == 0) return 0;
    if (value < 10) return parseFloat(value).toFixed(2);
    if (value < 1000) return parseFloat(value).toFixed(0);
    if (value < 1e6) return (value / 1000).toFixed(0) + "k";
    if (value < 1e9) return (value / 1000).toFixed(0) + "M";
  };
  
  if (!gevault.address || !vault.geVault) return <></>  
  
  const RewardsTag = () => {
    return (<div style={{backgroundColor: "#0A371B", color: theme.colorPrimary, borderRadius: 4, padding: "6px 8px", display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: "smaller" }}>
      <img src="/logo.svg" height={18} alt='Good Entry Logo' style={{ marginRight:4 }} />
      Rewards
    </div>)
  }  
  const DisabledTag = () => {
    return (<div style={{ backgroundColor: "#DC4446", borderRadius: 4, padding: "6px 8px", display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: "smaller" }}>
      <WarningOutlined style={{ marginRight:4 }} />
      Withdraw Only
    </div>)
  }
  
  const filled = Math.round(100 * gevaultDetails.tvl / gevaultDetails.maxTvl);

  
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
      onClick={()=>{router.push("/vaults/"+gevault.name)}}
    >
      <Card
        style= {{
          boxShadow: (highlightBox ? "0px 0px 30px rgba(15, 253, 106, 0.4)" : "" ) ,
          border: (highlightBox ? "1px solid #0FFD6A" : ""),
        }}
        bodyStyle= {{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between", height: '100%', gap: 12, 
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
          { gevault.status == "Rewards" ? <RewardsTag/> : <></> }
          { gevault.status == "Withdraw Only" ? <DisabledTag /> : <></> }
        </div>
        <span
          style={{ fontSize: "x-large", marginLeft: 8 }}
        >
          {gevaultDetails.name == "WETH-USDC" ? "ETH-USDC" : gevaultDetails.name}
        </span>
        <img src={gevaultDetails.icon} alt={vault.name.toLowerCase()} height={164} />
        
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
                    Supply Interest:{" "}
                    <span style={{ float: "right" }}>{parseFloat(gevaultDetails.supplyApr).toFixed(2)} %</span>
                    <br />
                    V3 Fees (7d annualized):{" "}
                    <span style={{ float: "right" }}>{parseFloat(gevaultDetails.feeApr).toFixed(2)} %</span>
                    <br />
                    Token Incentives: <span style={{ float: "right" }}>{parseFloat(gevaultDetails.airdropApr).toFixed(2)} %</span>
                  </div>
                }
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span style={{ fontSize: "large", fontWeight: 600 }}>
              {(parseFloat(gevaultDetails.totalApr)).toFixed(2)} %
            </span>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between"
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
            <span style={{ fontSize: "large", fontWeight: 600 }}>
              ${gevaultDetails.tvl == 0 ? <>0</> : toReadable(gevaultDetails.tvl)}
            </span>
        </div>
        <Slider value={filled} disabled={true} style={{marginTop: -12, marginBottom: -8}} />
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
              Max. Capacity
            </span>
            <span style={{ fontSize: "large", fontWeight: 600 }}>
              ${gevaultDetails.tvl == 0 ? <>0</> : toReadable(gevaultDetails.maxTvl)}
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
            <span style={{ fontSize: "large", fontWeight: 600 }}>
              ${toReadable(gevaultDetails.walletValue)}
            </span>
          </div>
        </div>
      </Card>
    </Col>
  )
}
  
export default GeVaultBox;