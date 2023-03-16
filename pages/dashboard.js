import { Col, Row, Button, Card, Input, Slider, Typography, Spin, Tooltip } from 'antd';
import VaultDashboard from "../components/vaultDashboard"
import useAddresses from '../hooks/useAddresses';


// Display all user assets and positions in all ROE LPs
const Dashboard = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];
  
  return (<div style={{ minWidth: 1200 }}>
    {
      vaults.map((vault) => {return <VaultDashboard vault={vault} key={vault.name} />})
    }
  </div>);
  
}

export default Dashboard;