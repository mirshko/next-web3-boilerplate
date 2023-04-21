import { useState, useEffect } from "react";
import { Button, Input, Spin, Slider, Card } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
import useAssetData from "../../hooks/useAssetData";
import getUserLendingPoolData from "../../hooks/getUserLendingPoolData";
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import useOptionsPositionManager from "../../hooks/useOptionsPositionManager";
import useLendingPoolContract from "../../hooks/useLendingPoolContract";
import DepositWithdrawalModalMultiAssets from "../depositWithdrawalModalMultiAssets";
import VaultPerpsStrikes from "./vaultPerpsStrikes";
import PayoutChart from "./payoutChart";
import MyMargin from "../myMargin";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { useTxNotification } from "../../hooks/useTxNotification";

const VaultPerpsForm = ({ vault, price, opmAddress, checkPositions }) => {
  const [assetInfo, setAssetData] = useState();
  const [strike, setStrike] = useState({});
  const [lowerStrike, setLowerStrike] = useState({});
  const [upperStrike, setUpperStrike] = useState({});
  const [direction, setDirection] = useState("Long");
  const { account, chainId } = useWeb3React();
  const [isSpinning, setSpinning] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [leverage, setLeverage] = useState(0);
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();

  const lpContract = useLendingPoolContract(vault.address);
  //const opm = useOptionsPositionManager(opmAddress)
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
  let marginUsage =
    totalCollateral > 0
      ? (100 * parseFloat(totalDebt).toFixed(2)) /
        parseFloat(totalCollateral) /
        0.94
      : 0;
  let marginAfterUsage =
    totalCollateral > 0
      ? (100 * (parseFloat(totalDebt) + parseFloat(inputValue)).toFixed(2)) /
        (parseFloat(totalCollateral) + parseFloat(inputValue)) /
        0.94
      : 0;

  // const strikeAsset = useAssetData(strike.address);
  const baseAsset = useAssetData(
    vault.name.split("-")[0] == vault.token0.name
      ? vault.token0.address
      : vault.token1.address,
    vault.address
  );

  const quoteAsset = useAssetData(
    vault.name.split("-")[1] == vault.token0.name
      ? vault.token0.address
      : vault.token1.address,
    vault.address
  );
  const { tokenAmounts, tokenAmountsExcludingFees, totalSupply } =
    useUnderlyingAmount(strike.address, vault);

  const lowerStrikeAsset = useAssetData(lowerStrike.address, vault.address);
  const upperStrikeAsset = useAssetData(upperStrike.address, vault.address);

  let asset = tokenAmountsExcludingFees.amount0 == 0 ? quoteAsset: baseAsset;
  let tokenTraded =
    tokenAmountsExcludingFees.amount0 == 0
      ? vault.token1.name
      : vault.token0.name;
  let maxOI =
    tokenAmountsExcludingFees.amount0 == 0
      ? tokenAmounts.amount1
      : tokenAmounts.amount0;

  let expectedEntry = price;
  if (direction == "Long" && strike.price < price) expectedEntry = price / 0.9965
  if (direction == "Short" && strike.price > price) expectedEntry = price * 0.9965

  const belowMin = parseFloat(inputValue) * asset.oraclePrice < 5;
  const aboveMargin = parseFloat(inputValue) * asset.oraclePrice > availableCollateral * 10;

  const openPosition = async () => {
    if (inputValue == 0) return;
    setSpinning(true);
    try {
      let tickerAmount = (
        (inputValue /
          (parseFloat(tokenAmountsExcludingFees.amount0) ||
            parseFloat(tokenAmountsExcludingFees.amount1))) *
        totalSupply
      ).toFixed(0); // whichever is non null

      const abi = ethers.utils.defaultAbiCoder;
      let swapSource = ethers.constants.AddressZero;
      let hasSwapped = false;
      // if buying ITM, need to swap
      if (
        (direction == "Long" && strike.price < price) ||
        (direction == "Short" && strike.price > price)
      ) {
        hasSwapped = true;
        swapSource =
          tokenAmountsExcludingFees.amount0 == 0
            ? vault.token1.address
            : vault.token0.address;
      }

      let params = abi.encode(
        ["uint8", "uint", "address", "address[]"],
        [0, vault.poolId, account, [swapSource]]
      );
      // flashloan( receiver, tokens, amounts, modes[2 for open debt], onBehalfOf, calldata params, refcode)
      console.log(
        opmAddress,
        [strike.address],
        [tickerAmount],
        [2],
        account,
        params,
        0
      );
      const { hash } = await lpContract.flashLoan(
        opmAddress,
        [strike.address],
        [tickerAmount],
        [2],
        account,
        params,
        0
      );
      let positionsData = JSON.parse(localStorage.getItem("GEpositions") ?? '{}' );
      if (!positionsData.hasOwnProperty(account)) positionsData[account] = {
        opened: {},
        closed: []
      }
      if (positionsData[account]["opened"][strike.address]){
        // TODO: merge several positions opened at the same strike
      }
      else {
        positionsData[account]["opened"][strike.address] = {
          ticker: strike.address,
          strike: strike.price, 
          amount: tickerAmount,
          amountBase: tokenTraded ==  baseAsset.name ? parseFloat(inputValue) : parseFloat(inputValue) / baseAsset.oraclePrice,
          vault: vault.address,
          direction: direction,
          entry: expectedEntry,
        }
      }
      localStorage.setItem("GEpositions", JSON.stringify(positionsData) );
      checkPositions();

      showSuccessNotification(
        "Position opened",
        "Position opened successful",
        hash
      );
    } catch (e) {
      console.log(e);
      console.log(tokenTraded, tokenTraded.oraclePrice, parseFloat(inputValue) * tokenTraded.oraclePrice , availableCollateral * 10)
      showErrorNotification(e.code, e.reason);
    }
    setSpinning(false);
  };

  useEffect(() => {
    if (price == 0) return;
    for (let k of vault.ticks) {
      if (k.price < price) {
        setLowerStrike({ price: k.price, address: k.address });
      }
      if (k.price > price) {
        setUpperStrike({ price: k.price, address: k.address });
        if (!strike.price) setStrike({ price: k.price, address: k.address });
        break;
      }
    }
  }, [JSON.stringify(vault), price, strike.price]);

  const isOpenPositionButtonDisabled =
    !strike.price ||
    isSpinning ||
    parseFloat(inputValue) == 0 ||
    parseFloat(inputValue) > maxOI ||
    aboveMargin ||
    belowMin;

  let openPositionButtonErrorTitle = "...";

  if (!strike.price) {
    openPositionButtonErrorTitle = "Pick a Strike-In";
  } else if (parseFloat(inputValue) == 0) {
    openPositionButtonErrorTitle = "Enter an Amount";
  } else if (parseFloat(inputValue) > maxOI) {
    openPositionButtonErrorTitle = "Max Borrowable Reached";
  } else if (aboveMargin) {
    openPositionButtonErrorTitle = "Not Enough Margin";
  } else if (belowMin) {
    openPositionButtonErrorTitle = "Amount too Low";
  }

  return (
  <>
    <Card style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
        <span style={{fontWeight: 600}}>Good Wallet</span>
        <DepositWithdrawalModalMultiAssets vault={vault} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'grey'}}>
        <span>
          Margin Available:{" "}
        </span>
        <span style={{ float: "right" }}>
          ${parseFloat(10 * availableCollateral).toFixed(2)} / {parseFloat(10*availableCollateral/(baseAsset.oraclePrice?baseAsset.oraclePrice:1)).toFixed(3)} {baseAsset.name}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'grey'}}>
        <span>
          Margin Usage:{" "}
        </span>
        <span style={{ float: "right" }}>
          {parseFloat(marginUsage).toFixed(2)}%
          {marginAfterUsage > marginUsage && parseFloat(inputValue) > 0 ? (
            <> &rarr; {marginAfterUsage.toFixed(2)}%</>
          ) : (
            ""
          )}
        </span>
      </div>
    </Card>
    <Card style={{ marginBottom: 8 }}>
      <div>
        {contextHolder}
        <Button
          type={direction == "Long" ? "primary" : "default"}
          style={{ width: "50%", textAlign: "center", borderRadius: "4px 0 0 4px" }}
          icon={<RiseOutlined style={{marginRight: 8}}/>}
          onClick={() => {
            setDirection("Long");
          }}
        >
          <strong>Long</strong>
        </Button>
        <Button
          type={direction == "Short" ? "primary" : "default"}
          style={{ width: "50%", textAlign: "center", borderRadius: "0 4px 4px 0" }}
          icon={<FallOutlined style={{marginRight: 8}} />}
          onClick={() => {
            setDirection("Short");
          }}
          danger={direction == "Short"}
        >
          <strong>Short</strong>
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 24,
          }}
        >
          <div>
            Activation Price<span style={{ float: "right" }}>Funding / 1h</span>
          </div>
          <div>
            {!account || price > 0 ? (
              <>
                {upperStrike.address && upperStrikeAsset.price > 0 ? (
                  <VaultPerpsStrikes
                    key={upperStrike.address}
                    asset={upperStrikeAsset}
                    onClick={setStrike}
                    isSelected={strike.price == upperStrike.price}
                  />
                ) : null}
                {lowerStrike.address && lowerStrikeAsset.price > 0 ? (
                  <VaultPerpsStrikes
                    key={lowerStrike.address}
                    asset={lowerStrikeAsset}
                    onClick={setStrike}
                    isSelected={strike.price == lowerStrike.price}
                  />
                ) : null}
              </>
            ) : (
              <Spin style={{ width: "100%", margin: "0 auto" }} />
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            Size
            <span
              style={{
                float: "right",
                cursor: "pointer",
                color: parseFloat(inputValue) > maxOI ? "#e57673" : undefined,
              }}
              onClick={() => {
                setInputValue(maxOI);
              }}
            >
            Max Borrow:{" "}
              {parseFloat(maxOI).toFixed(4)} {tokenTraded}
            </span>
          </div>
          <Input
            placeholder="Amount"
            suffix={tokenTraded}
            onChange={(e) => setInputValue(e.target.value)}
            key="inputamount"
            value={inputValue}
          />
          <span>Leverage</span>
          <Slider
            min={0}
            max={10}
            step={0.1}
            onChange={(newValue) => {
              setLeverage(newValue);
              setInputValue(
                ((availableCollateral * newValue) / asset.oraclePrice).toFixed(6)
              );
            }}
            value={typeof leverage === "number" ? leverage : 0}
            style={{ marginBottom: -8, marginTop: -2 }}
          />
          <div>
            <span>1x</span>
            <span style={{ float: "right" }}>10x</span>
          </div>
          <div style={{ marginTop: 0 }}>
            Expected Entry:
            <span
              style={{
                float: "right",
                cursor: "pointer",
              }}
            >
              {expectedEntry.toFixed(2)}
            </span>
          </div>
          {isSpinning ? (
            <Button type="default" style={{ width: "100%" }}>
              <Spin />
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={openPosition}
              disabled={isOpenPositionButtonDisabled}
              danger={direction == "Short"}
            >
              {isOpenPositionButtonDisabled
                ? openPositionButtonErrorTitle
                : "Open " + direction}
            </Button>
          )}
        </div>
      </div>
    </Card>
    <Card>
      <PayoutChart
        direction={direction}
        strike={strike.price}
        price={price}
        step={upperStrike.price - lowerStrike.price}
      />
    </Card>
  </>
  );
};

export default VaultPerpsForm;
