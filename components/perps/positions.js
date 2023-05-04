import React, { useState } from "react"
import { Card, Tooltip, Spin, Checkbox } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import PositionsRow from "./positionsRow";
import PositionsRowArbiscan from "./positionsRowArbiscan";

// show all positions
// unlike the rest, it should show positions from other pools as well
const Positions = ({ vaults, vault, positions, checkPositions, price }) => {
  const { account} = useWeb3React();
  const [isServerSidePnl, setServerSidePnl] = useState(false)
  const thStyle = {
    color: "#94A3B8",
    fontWeight: 500,
    textDecorationStyle: "dotted",
    textDecorationStyle: 'dotted', 
    textDecorationColor: 'grey',
    textDecorationLine: 'underline'
  }
  return (
    <Card style={{ marginTop: 8 }}>
      <strong>Positions</strong>
      <span style={{ float: 'right' }}>
        Onchain Data{" "}
        <Checkbox 
          onChange={()=>{setServerSidePnl(!isServerSidePnl)}}
          /> 
      </span>
      { !account || price > 0 ? (
        <table border={0}>
          <thead>
            <tr>
              <th align="left" style={{...thStyle, paddingLeft: 0}}>Instrument</th>
              <th align="left" style={thStyle}>Side</th>
              <th align="left" style={thStyle}>Size</th>
              <th align="left" style={thStyle}>
                Funding{" "}
                <Tooltip placement="right" title="Hourly funding rate">
                  <QuestionCircleOutlined />
                </Tooltip>
              </th>
              <th align="left" style={thStyle}>Entry Price</th>
              <th align="left" style={thStyle}>PNL&nbsp;&nbsp;</th>
              <th align="left" style={{...thStyle, paddingRight: 0}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              isServerSidePnl ?
                vaults.map((vault) => {
                  return (
                    <React.Fragment key={vault.address}>
                      {vault.ticks.map((tick) => {
                        return (
                          <PositionsRowArbiscan
                              address={tick.address}
                              vault={vault}
                              key={tick.address}
                              price={price}
                            />
                        );
                      })}
                    </React.Fragment>
                  );
                })
              : positions.map((pos)=>{
                  return (
                    <PositionsRow
                      key={pos.ticker}
                      position={pos}
                      price={price}
                      checkPositions={checkPositions}
                    />)
                })
            }
          </tbody>
        </table>
      ) : (
        <Spin style={{ width: "100%", margin: "0 auto" }} />
      )}
    </Card>
  );
};

export default Positions;
