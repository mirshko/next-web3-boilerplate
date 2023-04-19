import React from "react"
import { Card, Tooltip, Spin } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import PositionsRow from "./positionsRow";

// show all positions
// unlike the rest, it should show positions from other pools as well
const Positions = ({ positions, checkPositions, price }) => {
  const { account} = useWeb3React();
  
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
            {positions.map((pos)=>{
              return (
              <PositionsRow
                  key={pos.ticker}
                  position={pos}
                  checkPositions={checkPositions}
                />)
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
