import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Checkbox, Button } from "antd";
import useAddresses from "../hooks/useAddresses";
import getUserLendingPoolData from "../hooks/getUserLendingPoolData";
import useUniswapPrice from "../hooks/useUniswapPrice";
import VaultPositionsRow from "./vaultPositionsRow";
import MyMargin from "./myMargin";
import { ethers } from "ethers";
import axios from "axios";

/**
  Displays user positions in a vault
  That includes:
    - single assets
    - LPv2 positions (whether supply or debt)
    - Rangers (supply or debt)
*/
const VaultPositions = ({ vault }) => {
  const [assets, setAssets] = useState([]);
  const [hideEmpty, setHideEmpty] = useState(true);
  const { chainId } = useWeb3React();
  const ADDRESSES = useAddresses();
  const onChange = (e) => {
    setHideEmpty(!hideEmpty);
  };
  const price = useUniswapPrice(
    vault.uniswapPool,
    vault.token0.decimals - vault.token1.decimals
  );

  // Vault-level data
  const userAccountData = getUserLendingPoolData(vault.address);
  var healthFactor = ethers.utils.formatUnits(
    userAccountData.healthFactor ?? 0,
    18
  );
  var availableCollateral = ethers.utils.formatUnits(
    userAccountData.availableBorrowsETH ?? 0,
    8
  );
  var totalCollateral = ethers.utils.formatUnits(
    userAccountData.totalCollateralETH ?? 0,
    8
  );
  var totalDebt = ethers.utils.formatUnits(
    userAccountData.totalDebtETH ?? 0,
    8
  );

  const columns = [
    { key: "asset", title: "Position", dataIndex: "name" },
    { key: "deposited", title: "Balance", dataIndex: "deposited" },
    { key: "debt", title: "Debt", dataIndex: "debt" },
    { key: "pnl", title: "PnL", dataIndex: "pnl" },
    { key: "action", dataIndex: "action", title: "Action" },
  ];

  var assetsList = [
    vault.token0.address,
    vault.token1.address,
    //vault.lpToken.address,
  ];
  //for (let r of vault.ranges) assetsList.push(r['address'])
  for (let r of vault.ticks) {
    // TODO: better definition
    let step = vault.name == "WETH-USDC" ? 100 : 5; // 100 step for weth, 5 step for gmx
    assetsList.push(r["address"]);
  }

  var orderedList = [];

  return (
    <div style={{ width: "100%" }}>
      <Typography.Title level={2}>geVault {vault.name}</Typography.Title>
      <Typography.Text>
        Price: 1 {vault.name.split("-")[0]} = {price.toFixed(2)}{" "}
        {vault.name.split("-")[1]}
        <br />
        {/* Margin Available: ${parseFloat(totalCollateral).toFixed(2)} - Debt: ${parseFloat(totalDebt).toFixed(2)} - 
      Margin Ratio: <MyMargin value={(100 * parseFloat(totalDebt).toFixed(2) / parseFloat(totalCollateral) / 0.94).toFixed(2)} /> - 
      Health Factor: {healthFactor > 100 ? <>&infin;</> : parseFloat(healthFactor).toFixed(3)} */}
        <Checkbox
          style={{ float: "right", marginBottom: 4, marginRight: 24 }}
          defaultChecked={hideEmpty}
          onChange={onChange}
        >
          Hide empty positions
        </Checkbox>
      </Typography.Text>
      <Card style={{ borderWidth: 0 }} bodyStyle={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th align="right">Balance</th>
              <th align="right">APR</th>
              <th align="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assetsList.map((assetAddress) => (
              <VaultPositionsRow
                assetAddress={assetAddress}
                vault={vault}
                hideEmpty={hideEmpty}
                key={assetAddress}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default VaultPositions;
