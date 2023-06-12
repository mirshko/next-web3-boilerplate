import { Button, Card, Row, Col, Divider, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import GeVaultBox from "../components/goodvaults/geVaultBox";
import useAddresses from "../hooks/useAddresses";

// Display all user assets and positions in all ROE LPs
const GoodVaults = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];
  
  const gev = [];
  const gev_disabled = []
  for( let v of vaults){
    for (let gv of v.geVault){
      gv.vault = v
      if(gv.status == "Withdraw Only") gev_disabled.push(gv)
      else gev.push(gv)
    }
  }
  const allgev = [...gev, ...gev_disabled];

  return (
    <div style={{ width: 1400 }}>
      <Typography.Title>ezVaults</Typography.Title>
      <Row gutter={24} style={{ marginTop: 24 }}>
        {
          allgev.map((gv) => <GeVaultBox vault={gv.vault} key={gv.name} gevault={gv} />)
        }
      </Row>
    </div>
  );
};

export default GoodVaults;
