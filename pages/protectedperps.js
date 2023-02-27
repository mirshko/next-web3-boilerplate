import { useEffect, useState } from 'react'
import { Col, Row, Button, Card, Input, Typography, Spin, Divider } from 'antd';

import VaultPerpsForm from "../components/perps/vaultPerpsForm"
import Positions from "../components/perps/positions"
import Infobar from '../components/perps/infobar'
import useAddresses from '../hooks/useAddresses';
import Chart from '../components/perps/chart'

// Display all user assets and positions in all ROE LPs
const ProtectedPerps = () => {
  const [currentVault, selectVault ] = useState(0)
  const [price, setPrice] = useState(1666.68);
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];

  return (
    <div style={{ minWidth: 1200, display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: 850 }}>
        <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 8 }}>
          <Infobar vaults={vaults} current={currentVault} selectVault={selectVault} price={price} />
        </Card>
        <Chart ohlcUrl={vaults[currentVault].ohlcUrl} setPrice={setPrice} />
        <Positions vaults={vaults}/>
      </div>
      <div>
        <Card style={{ marginLeft: 24, minWidth: 300 }}>
          <VaultPerpsForm vault={vaults[currentVault]} price={price} />
        </Card>
        <Card style={{ marginLeft: 24, marginTop: 24, minWidth: 300 }}>
          Pick a Strike: above, your PnL behaves like regular perps; below, your PnL stays at 0, cannot be negative, and you only pay funding.
          <br />
          <Button style={{float: 'right'}}>More Details &rarr;</Button>
        </Card>
      </div>
    </div>
);
  
}

export default ProtectedPerps;