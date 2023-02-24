import { Col, Row, Button, Card, Input, Slider, Typography, Spin, Tooltip } from 'antd';
import VaultPositions from "../components/vaultPositions"
import useAddresses from '../hooks/useAddresses';


// Display all user assets and positions in all ROE LPs
const Dashboard = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];
  
  return (<div style={{ minWidth: 1200 }}>
    <Typography.Title>
      Dashboard
    </Typography.Title>
    
    {
      vaults.map((vault) => {return <VaultPositions vault={vault} key={vault.name} />})
    }
  </div>);
  
}

export default Dashboard;