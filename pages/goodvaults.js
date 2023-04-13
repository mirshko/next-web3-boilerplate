import { Button, Card, Row, Col, Divider, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import GeVaultBox from "../components/goodvaults/geVaultBox";
import useAddresses from "../hooks/useAddresses";

// Display all user assets and positions in all ROE LPs
const GoodVaults = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];

  return (
    <div style={{ minWidth: 1400 }}>
      <Row gutter={24}>
        <Col md={12}>
          <Card>
            <div style= {{ display: 'flex', justifyContent: 'space-between'}}>
              <Col>
                p
              </Col>
              <Col>
                d
              </Col>
            </div>
            <Divider />
            Assets
          </Card>
        </Col>
        <Col md={12}>
          <Card>
            <div style={{}}>
              <WarningOutlined style={{ marginRight: 8 }} />
              Risks
            </div>
            Good Vaults aggregate and automatically rebalance liquidity.
          </Card>
        </Col>
      </Row>
      <Typography.Title level={2}>Good Vaults</Typography.Title>
      <Row gutter={24} style={{ marginTop: 24 }}>
        {vaults.map((vault) => {
          return <GeVaultBox vault={vault} key={vault.name} />;
        })}
      </Row>
    </div>
  );
};

export default GoodVaults;
