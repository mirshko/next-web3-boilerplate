import { Button, Card, Row, Col, Divider, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import GeVaultBox from "../components/goodvaults/geVaultBox";
import useAddresses from "../hooks/useAddresses";

// Display all user assets and positions in all ROE LPs
const GoodVaults = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];

  return (
    <div style={{ width: 1400 }}>
      <Typography.Title>EzVaults</Typography.Title>
      <Row gutter={24} style={{ marginTop: 24 }}>
        {vaults.map((vault) => {
          return <GeVaultBox vault={vault} key={vault.name} />;
        })}
      </Row>
    </div>
  );
};

export default GoodVaults;
