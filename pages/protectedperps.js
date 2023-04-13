import { useEffect, useState } from "react";
import { Col, Row, Button, Card, Input, Typography, Spin, Divider } from "antd";

import VaultPerpsForm from "../components/perps/vaultPerpsForm";
import Positions from "../components/perps/positions";
import Infobar from "../components/perps/infobar";
import Chart from "../components/perps/chart";
import useAddresses from "../hooks/useAddresses";
import useUniswapPrice from "../hooks/useUniswapPrice";
import useCandles from "../hooks/useCandles";
import useTheme from "../hooks/useTheme";

// Display all user assets and positions in all ROE LPs
const ProtectedPerps = () => {
  const theme = useTheme()
  console.log(theme)
  const [currentVault, selectVault] = useState(0);
  const [positions, setPositions] = useState([]);
  const [interval, setInterval] = useState("1h");
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];

  let intervalBybit = interval;
  if (interval == "15m") intervalBybit = "15";
  else if (interval == "1h") intervalBybit = "60";
  else if (interval == "4h") intervalBybit = "240";
  else if (interval == "1d") intervalBybit = "D";

  let candles = useCandles(vaults[currentVault].ohlcUrl + intervalBybit);
  let price = useUniswapPrice(
    vaults[currentVault].uniswapPool,
    vaults[currentVault].token0.decimals - vaults[currentVault].token1.decimals
  );

  const addPosition = (newPos) => {
    for (let p of positions)
      if (p.name == newPos.name && p.price == newPos.price) return;
    setPositions([...positions, newPos]);
  };
  const gap = 12;

  return (
    <div style={{ minWidth: 1500, display: "flex", flexDirection: "row" }}>
      <div style={{ width: 1043 }}>
        <Card style={{ marginBottom: gap }} bodyStyle={{ padding: 8 }}>
          <Infobar
            vaults={vaults}
            current={currentVault}
            selectVault={selectVault}
            price={price}
          />
        </Card>
        <Chart
          interval={interval}
          setInterval={setInterval}
          candles={candles}
          positions={positions}
        />
        <Positions vaults={vaults} addPosition={addPosition} price={price} />
      </div>
      <div style={{ width: 343, marginLeft: gap}}>
        <VaultPerpsForm
          vault={vaults[currentVault]}
          price={price}
          opmAddress={ADDRESSES["optionsPositionManager"]}
        />
        <Card style={{ marginLeft: gap, marginTop: gap, minWidth: 300 }}>
          Regardless if you long or short the asset, the max loss is always the
          activation price selected while the max gains are uncapped. The main
          risk is paying the hourly funding rate to maintain your position.
          <br />
          <Button
            href="https://goodentry.io/academy"
            target="_blank"
            style={{ marginTop: "10px" }}
          >
            More Details &rarr;
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ProtectedPerps;
