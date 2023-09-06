import { useState } from "react";
import useGeVault from "../../hooks/useGeVault";
import { Card, Col, Popover, Button } from "antd";
import { ethers } from "ethers";
import MigrationVault_ABI from "../../contracts/MigrationVault.json";
import useContract from "../../hooks/useContract";

const MigrationBox = ({vault, sourceGeVaultAddress, targetGeVault}) => {
  const [sourceVaultBal, setSourceVaultBal] = useState(0);
  var tp = new ethers.providers.JsonRpcProvider("http://localhost:8545") 
  const signer = tp.getSigner()
  const cs = new ethers.Contract("0x955573549C68302725da4D70a4B225aca1270193", MigrationVault_ABI, signer)
  const svault = useGeVault(vault, {address: sourceGeVaultAddress});
  console.log(vault, svault)
  
  const migrate = async () => {

    /* we try to migrate, 3 cases
      - can use token0 (enough token0 is available)
      - if it failsm try with token1
      - if that fails too, liquidity should be migrated in several smaller steps. should migration in several steps, which is tricky, but not too likely either if large holders dont migrate last
    */
    const subMigrate = async (usedToken) => {
      try {
        console.log('migrate with token', usedToken);
        
        return true;
      }
      catch(e){
        return false;
      }
    }
    
    let res = subMigrate(vault.token0.address);
    if(!res) res = subMigrate(vault.token1.address);
    
    // if(!res) // migration failed
    
  }
  if (svault.wallet == 0) return <></>
  
  return(<Card style={{marginLeft: 64, color: 'white', marginBottom: 24 }} >
      <h4>Migrate old liquidity</h4>
      <Button type="primary" onClick={migrate} >Migrate</Button>
    </Card>
  )
}
  
export default MigrationBox;