import React, { useState } from "react"
import { Card, Tooltip, Spin, Checkbox, Tabs } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useWeb3React } from "@web3-react/core";
import PositionsRow from "./positionsRow";
import PositionsRowV2 from "./positionsRowV2";
import PositionsRowArbiscan from "./positionsRowArbiscan";
import PositionsHistory from "./positionsHistory"
import usePositionsHistory from "../../hooks/usePositionsHistory";

// show all positions
// unlike the rest, it should show positions from other pools as well
const Positions = ({ vaults, vault, positions, checkPositions, price, refresh }) => {
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
  console.log('refresh',refresh)
  const history = usePositionsHistory(account, refresh);
  const serverPos = history.status ?? {};
  
  return (
    <Card style={{ marginTop: 8 }}>
      <Tabs
          defaultActiveKey="Positions"

          items={[
            {
              label: "Positions",
              key: "Positions",
              children: <>
              
              {!account || price > 0 ? 
                <span style={{ float: 'right' }}>
                  Onchain Data{" "}
                  <Checkbox 
                    onChange={()=>{setServerSidePnl(!isServerSidePnl)}}
                    /> 
                </span>
                : <></>
              }
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
                                      checkPositions={checkPositions}
                                    />
                                );
                              })}
                            </React.Fragment>
                          );
                        })
                      : <>
                      {Object.keys(serverPos).map((debtAddress) => {
                          if ( !debtAddress || serverPos[debtAddress].debt == 0 ) return (<></>)
                          else return (
                            <PositionsRowV2
                              key={debtAddress + "v2"}
                              position={serverPos[debtAddress]}
                              debtAddress={debtAddress}
                              price={price}
                              checkPositions={checkPositions}
                              refresh={refresh}
                            />)
                        })
                      }
                      {positions.map((pos)=>{
                          if(serverPos && serverPos.hasOwnProperty(pos.ticker.toLowerCase())) return <></>
                          else return (
                            <PositionsRow
                              key={pos.ticker}
                              position={pos}
                              price={price}
                              checkPositions={checkPositions}
                            />)
                        })
                      }</>
                    }
                  </tbody>
                </table>
              ) : (
                <Spin style={{ width: "100%", margin: "0 auto" }} />
              )}</>
            },
            {
              label: "History",
              key: "History",
              children: <PositionsHistory account={account} />
            },
          ]}
        />
    </Card>
  );
};

export default Positions;
