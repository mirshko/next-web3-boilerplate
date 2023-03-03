import { useEffect, useState } from 'react'
import { Col, Row, Button, Card, Input, Typography, Spin, Divider } from 'antd';

import VaultPerpsForm from "../components/perps/vaultPerpsForm"
import Positions from "../components/perps/positions"
import Infobar from '../components/perps/infobar'
import Chart from '../components/perps/chart'
import useAddresses from '../hooks/useAddresses';
import useCandles from '../hooks/useCandles';

// Display all user assets and positions in all ROE LPs
const ProtectedPerps = () => {
  const [currentVault, selectVault ] = useState(0)
  const [price, setPrice] = useState(0);
  const [positions, setPositions ] = useState([])
  const [ interval, setInterval ] = useState('1h')
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];
  
  let candles = useCandles( vaults[currentVault].ohlcUrl + interval )

  useEffect( () => {
    if (candles.length>0) setPrice( (parseFloat(candles[candles.length-1].close)).toFixed(2) )
  }, [candles])

  const addPosition = (newPos) => {
    for (let p of positions)
      if (p.name == newPos.name && p.price == newPos.price) return;
    setPositions([...positions, newPos])
  }

  return (
    <div style={{ minWidth: 1200, display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: 850 }}>
        <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 8 }}>
          <Infobar vaults={vaults} current={currentVault} selectVault={selectVault} price={price} />
        </Card>
        <Chart interval={interval} setInterval={setInterval} candles={candles} positions={positions} />
        <Positions vaults={vaults} addPosition={addPosition}/>
      </div>
      <div>
        <Card style={{ marginLeft: 24, minWidth: 300 }}>
          <VaultPerpsForm vault={vaults[currentVault]} price={price} opmAddress={ADDRESSES['optionsPositionManager']} />
        </Card>
        <Card style={{ marginLeft: 24, marginTop: 24, minWidth: 300 }}>
          Above the strike-in, your PnL behaves like regular perps; below, your PnL stays at 0, cannot be negative, and you only pay funding.
          <br />
          <Button style={{float: 'right'}} disabled>More Details &rarr;</Button>
        </Card>
      </div>
    </div>
);
  
}

export default ProtectedPerps;