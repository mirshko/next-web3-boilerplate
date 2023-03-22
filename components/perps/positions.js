import React from "react";
import { Card, Tooltip, Spin } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import PositionsRow from "./positionsRow";

// show all positions
// unlike the rest, it should show positions from other pools as well
const Positions = ({ vaults, positions, addPosition, price }) => {
  const { account} = useWeb3React();
  return (
    <Card style={{ marginTop: 24 }}>
      <strong>Positions</strong>
      { !account || price > 0 ? (
        <table>
          <thead>
            <tr>
              <th align="left">Asset</th>
              <th align="left">Side</th>
              <th align="left">Entry</th>
              <th align="left">Size</th>
              <th align="right">
                Funding{" "}
                <Tooltip placement="right" title="Hourly funding rate">
                  <QuestionCircleOutlined />
                </Tooltip>
              </th>
              <th align="right">PnL&nbsp;&nbsp;</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => {
              return (
                <React.Fragment key={vault.address}>
                  {vault.ticks.map((tick) => {
                    return (
                      <PositionsRow
                        key={tick.address}
                        address={tick.address}
                        vault={vault}
                        positions={positions}
                        addPosition={addPosition}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      ) : (
        <Spin style={{ width: "100%", margin: "0 auto" }} />
      )}
    </Card>
  );
};

export default Positions;
