import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import {
  Col,
  Row,
  Button,
  Card,
  Input,
  Typography,
  Tooltip,
  Divider,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import LendingPoolTable from "../components/lendingPoolTable";
import DepositNoLevModal from "../components/depositNoLevModal";
import Chart from "../components/perps/chart";
import CdsPositionRow from "../components/cdsPositionRow";

import useUnderlyingAmount from "../hooks/useUnderlyingAmount";
import useAddresses from "../hooks/useAddresses";
import useAssetData from "../hooks/useAssetData";
import getUserLendingPoolData from "../hooks/getUserLendingPoolData";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useLonggPositionManager from "../hooks/useLonggPositionManager";
import { ethers } from "ethers";
import { useTxNotification } from "../hooks/useTxNotification";

function CDS() {
  const { account } = useWeb3React();
  const router = useRouter();
  let { vault, asset } = router.query;
  let lpAddress = vault;

  const [price, setPrice] = useState(0);
  const [selectedRange, selectRange] = useState(0);
  const [ranges, setRanges] = useState([]);
  const [inputValue, setInputValue] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [percentDebt, setPercentDebt] = useState(90);
  const [isSpinning, setSpinning] = useState(false);
  const onChangeLeverage = (newVal) => {
    setLeverage(newVal);
  };

  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();

  const vaultAddresses = useAddresses(lpAddress);
  const lendingPool =
    vaultAddresses["lendingPools"].length > 0
      ? vaultAddresses["lendingPools"][0]
      : {};
  const rangeAddresses = lendingPool["lpToken"] ? [lendingPool["lpToken"]] : [];
  for (let p in lendingPool.ranges) rangeAddresses.push(lendingPool.ranges[p]);

  var token0 = useAssetData(
    lendingPool.token0 ? lendingPool.token0.address : null,
    lpAddress
  );
  var token1 = useAssetData(
    lendingPool.token1 ? lendingPool.token1.address : null,
    lpAddress
  );
  var cdsAsset = useAssetData(asset, lpAddress);
  var lpContract = useLendingPoolContract(lpAddress);
  var lpm = useLonggPositionManager();

  var assets = [
    { key: 0, ...token0 },
    { key: 1, ...token1 },
  ];

  // Token amounts: if v3, use values from the TR smart contract - useCLPValues return $1 worth of tokens
  const tokenAmounts = useUnderlyingAmount(
    ranges.length > 0 ? ranges[selectedRange].address : null,
    lendingPool
  );

  const userAccountData = getUserLendingPoolData(lpAddress);
  var healthFactor = ethers.utils.formatUnits(
    userAccountData.healthFactor ?? 0,
    18
  );
  var availableCollateral = ethers.utils.formatUnits(
    userAccountData.availableBorrowsETH ?? 0,
    8
  );

  // Longg position
  const longg = async () => {
    try {
      //bytes memory params = abi.encode(0, msg.sender, assetSold, amountSoldInPercent, address(0x0), poolId); (uint8, address, address, uint, address, uint)
      //LP.flashLoan( address(this), assets, amounts, flashtype, msg.sender, params, 0);
      const abi = ethers.utils.defaultAbiCoder;
      let params = abi.encode(
        ["uint8", "address", "address", "uint", "address", "uint"],
        [
          0,
          account,
          ethers.constants.AddressZero,
          0,
          ethers.constants.AddressZero,
          lendingPool.poolId,
        ]
      );
      console.log("inerte", inputValue);
      console.log(
        lpm.address,
        [cdsAsset.address],
        [
          ethers.utils
            .parseUnits(parseFloat(inputValue).toFixed(18), 18)
            .toString(),
        ],
        [2],
        account,
        params,
        0
      );

      const { hash } = await lpContract.flashLoan(
        lpm.address,
        [cdsAsset.address],
        [ethers.utils.parseUnits(parseFloat(inputValue).toFixed(18), 18)],
        [2],
        account,
        params,
        0
      );

      showSuccessNotification(
        "Position opened",
        "Position opened successful",
        hash
      );
    } catch (e) {
      console.log("longg error", e);
      showErrorNotification(e.code, e.message);
    }
  };

  // rebalance no leverage inputs based on asset ratio and user input
  const setNoLevValues = (val) => {
    if (val.asset0 == 0 || val.asset1 == 0) return setNoLevInputs([0, 0]);
    if (val.asset0 && tokenAmounts.amount0 > 0)
      return setNoLevInputs([
        val.asset0,
        (tokenAmounts.amount1 * val.asset0) / tokenAmounts.amount0,
      ]);
    if (val.asset1 && tokenAmounts.amount1 > 0)
      return setNoLevInputs([
        (tokenAmounts.amount0 * val.asset1) / tokenAmounts.amount1,
        val.asset1,
      ]);
  };

  const maxBorrow = Math.min(
    cdsAsset.tvl, // min (available, debt ceiling)
    (availableCollateral * 0.9) / cdsAsset.oraclePrice
  );

  return (
    <div>
      <Typography.Title>
        Impermanent Gainooor: {token0.name}-{token1.name}
        {contextHolder}
      </Typography.Title>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12} type="flex">
          <Typography.Title level={2}>Collateral</Typography.Title>

          <Typography.Paragraph>
            Base debt available:{" "}
            <span style={{ fontWeight: "bold" }}>${availableCollateral} </span>-
            Health ratio:
            <span
              style={{
                color:
                  healthFactor > 1.01
                    ? "green"
                    : healthFactor > 1
                    ? "orange"
                    : "red",
              }}
            >
              {healthFactor > 100 ? (
                <span style={{ fontSize: "larger" }}> &infin; </span>
              ) : (
                parseFloat(healthFactor).toFixed(3)
              )}
            </span>
            &nbsp;
            <Tooltip
              placement="right"
              title="Keep your health factor above 1.01 to avoid liquidations"
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </Typography.Paragraph>
          <LendingPoolTable
            assets={assets}
            lendingPool={lendingPool}
            isMinimal={true}
          />
        </Col>

        <Col span={12} type="flex">
          <Typography.Title level={2}>Open an IG position</Typography.Title>
          <Typography.Paragraph>
            Be exposed to price moves in either direction, with pay-as-you-go
            funding.
          </Typography.Paragraph>
          <Card bordered={false} style={{}} bodyStyle={{ height: "100%" }}>
            <div style={{}}>
              <span>
                {cdsAsset.name}
                <span
                  onClick={() => {
                    setInputValue(maxBorrow);
                  }}
                  style={{ float: "right", fontSize: "smaller" }}
                >
                  Max: {maxBorrow}
                </span>
              </span>
              <Input
                value={inputValue}
                style={{ marginBottom: 12 }}
                onChange={(e) => {
                  console.log(e.target.value);
                  setInputValue(e.target.value);
                }}
              />
              <span>
                Position value: $
                {(inputValue * cdsAsset.oraclePrice).toFixed(2)}
              </span>
              <br />

              <Button
                type="primary"
                disabled={availableCollateral < 1}
                style={{ marginTop: 16 }}
                onClick={longg}
              >
                {availableCollateral == 0 ||
                availableCollateral <
                  (0.9 * inputValue * cdsAsset.price) / 1e8 ? (
                  <>Not enough collateral</>
                ) : (
                  <>Open Position</>
                )}
              </Button>
              <Divider />

              <span>
                Available for borrow: $
                {(cdsAsset.tvl * cdsAsset.oraclePrice).toFixed(2)}
              </span>
              <br />
              <span>Funding rate: ${cdsAsset.debtApr}</span>
            </div>
          </Card>
        </Col>

        <Col span={24} type="flex">
          <Typography.Title level={2}>Positions</Typography.Title>
          <Card title="Positions">
            <table>
              <thead>
                <tr>
                  <th align="left">Asset</th>
                  <th align="left">Amount</th>
                  <th align="left">Value</th>
                  <th align="left">
                    Funding{" "}
                    <Tooltip placement="right" title="Hourly funding rate">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </th>
                  <th align="left">PnL</th>
                </tr>
              </thead>
              <tbody>
                {lendingPool["lpToken"] && (
                  <CdsPositionRow
                    assetAddress={lendingPool["lpToken"].address}
                    vault={lendingPool}
                  />
                )}
                {lendingPool["ranges"] &&
                  lendingPool["ranges"].length > 0 &&
                  lendingPool["ranges"].map((range) => (
                    <CdsPositionRow
                      key={range.address}
                      assetAddress={range.address}
                      vault={lendingPool}
                    />
                  ))}
              </tbody>
            </table>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CDS;
