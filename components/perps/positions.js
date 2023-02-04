import React from 'react'
import { Card, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons';
import PositionsRow from './positionsRow'

// show all positions
// unlike the rest, it should show positions from other pools as well
const Positions = ({vaults}) => {
  return (<Card style={{ marginTop: 24 }}>
    <strong>Positions</strong>
    <table>
      <thead>
        <tr>
          <th align='left'>Asset</th>
          <th align='left'>Amount</th>
          <th align='right'>Funding <Tooltip placement="right" title="Hourly funding rate"><QuestionCircleOutlined /></Tooltip></th>
          <th align='right'>PnL</th>
        </tr>
      </thead>
      <tbody>
      {vaults.map( (vault) => {
        return (<React.Fragment key={vault.address}>
          {
            vault.ticks.map((tick) => {
              return <PositionsRow key={tick.address} address={tick.address} vault={vault} opmAddress={vaults.opmAddress} />
            })
            }
        </React.Fragment>)
      })}
      </tbody>
    </table>
  </Card>)  
}


export default Positions;