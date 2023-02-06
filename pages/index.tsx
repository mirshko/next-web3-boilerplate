import Link from "next/link";
import { Table, Button, Card, Typography } from 'antd';
import VaultCard from '../components/vaultCard';
import useVaultData from "../hooks/useVaultData";
import { useWeb3React } from "@web3-react/core";

function Home() {
  let activeChainOnly = true;
  var vaults = useVaultData(activeChainOnly);
 
  return (
    <div style={{width: '100%', minWidth: '1200px'}}>
      <Card style={{ marginBottom: '20px'}}><img src="/explanation.png" alt="explanation"/></Card>
        { vaults.map( (vault) => {return (<VaultCard vault={vault} key={vault.name} />)})}
    </div>
  );
}

export default Home;
