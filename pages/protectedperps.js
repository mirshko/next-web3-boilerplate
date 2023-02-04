import { useEffect, useState } from 'react'
import { Col, Row, Button, Card, Input, Typography, Spin, Tooltip } from 'antd';

import VaultPerpsForm from "../components/perps/vaultPerpsForm"
import Positions from "../components/perps/positions"
import Infobar from '../components/perps/infobar'
import useAddresses from '../hooks/useAddresses';
import Chart from '../components/chart'

// Display all user assets and positions in all ROE LPs
const ProtectedPerps = () => {
  const [currentVault, setCurrentVault ] = useState(0)
  const [price, setPrice] = useState(1666.68);
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];
  


  /*useEffect( () => {
    // get
    
  }, [])*/


  return (
    <div style={{ minWidth: 1200, display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: 850 }}>
        <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 8 }}>
          <Infobar vaults={vaults} current={currentVault} selectVault={setCurrentVault} price={price} />
        </Card>
        <Chart ohlcUrl={vaults[currentVault].ohlcUrl} setPrice={setPrice} />
        <Positions vaults={vaults}/>
      </div>
      <Card style={{ marginLeft: 24, height: '100%', minWidth: 300 }}>
        <VaultPerpsForm vault={vaults[currentVault]} price={price} opmAddress={ADDRESSES['optionsPositionManager']} />
      </Card>
    </div>
);
  
}

export default ProtectedPerps;