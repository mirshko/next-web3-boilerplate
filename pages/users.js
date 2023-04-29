import { useState, useEffect } from "react";
import { Card, Typography, Checkbox, Col, Row } from "antd";
import VaultDashboard from "../components/vaultDashboard"
import useAddresses from '../hooks/useAddresses';
import axios from "axios";

// Display all user assets and positions in all ROE LPs
const Users = ({}) => {
  const [userStats, setUserStats ] = useState({})
  const [liquidation, setLiquidation] = useState({})

  const [hideHighHF, setHideHighHF] = useState(false)
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES['lendingPools'];

  useEffect(()=>{
    const getData = async () => {
      const url = "https://roe.nicodeva.xyz/stats/arbitrum/users.json";
      var dataraw = (await axios.get(url)).data;
      setUserStats(dataraw)
      console.log(vaults)
    }
    getData();
  },[])
  
  return (<div style={{ minWidth: 1200 }}>
    <Row gutter={24}>
      <Col md={18}>
        <Typography.Title>User Positions</Typography.Title>
        <Checkbox onChange={()=>{setHideHighHF(!hideHighHF)}}>Hide High HF</Checkbox>
        {
          vaults.map((vault) => {
            return (
          <>
            Users
            <Card title={<>{vault.name}<span style={{float:'right'}}>{userStats && userStats[vault.address] ? Object.keys(userStats[vault.address]).length : 0} Users</span></>}>
            <table>
              <tr>
                <th align="left">User Address</th>
                <th align="left">Health Factor</th>
                <th align="left">Total Collateral</th>
                <th align="left">Total Debt</th>
              </tr>
              {
                userStats[vault.address] ? 
                  Object.keys(userStats[vault.address]).map(userAddress => {
                    if (
                      userAddress.substring(0,2) != "0x" 
                      || (hideHighHF && userStats[vault.address][userAddress].healthFactor > 1.05)
                      || userStats[vault.address][userAddress].totalCollateral == 0
                    ) return <></>;
                    return (
                      <tr style={{cursor: 'pointer'}} onClick={()=>{setLiquidation(userStats[vault.address][userAddress])}}>
                        <td>{userAddress}</td>
                        <td>{userStats[vault.address][userAddress].healthFactor < 10 ? (userStats[vault.address][userAddress].healthFactor).toFixed(3) : <>&infin;</>}</td>
                        <td>$ {(userStats[vault.address][userAddress].totalCollateral / 1e8).toFixed(3)}</td>
                        <td>$ {(userStats[vault.address][userAddress].totalDebt / 1e8).toFixed(3)}</td>
                      </tr>
                    )
                  })
                  : ""
              }
            </table>
            </Card>
          </>
          )
          })
        }
      </Col>
      <Col>
        <Card title="Finish Him!"
          style={{
              position: 'fixed',
              marginTop: 96
          }}
        >
        </Card>
      </Col>
    </Row>
  </div>);
  
}

export default Users;