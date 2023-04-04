import { Button, Card, Row } from "antd";
import GeVaultBox from "../components/geVaultBox";
import useAddresses from "../hooks/useAddresses";

// Display all user assets and positions in all ROE LPs
const GoodVaults = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];

  return (
    <div style={{ minWidth: 1200 }}>
      <Card>
        Good Vaults aggregate and automatically rebalance liquidity.
        <br />
        <Button
          href="https://goodentry.io/academy"
          target="_blank"
          style={{ marginTop: "10px" }}
        >
          More Details &rarr;
        </Button>
      </Card>
      <Row gutter={24} style={{ marginTop: 24 }}>
        {vaults.map((vault) => {
          return <GeVaultBox vault={vault} key={vault.name} />;
        })}
      </Row>
    </div>
  );
};

export default GoodVaults;
