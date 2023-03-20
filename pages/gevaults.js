import {
  Col,
  Row,
  Button,
  Card,
  Input,
  Slider,
  Typography,
  Spin,
  Tooltip,
} from "antd";
import VaultPositions from "../components/vaultPositions";
import useAddresses from "../hooks/useAddresses";

// Display all user assets and positions in all ROE LPs
const Farm = ({}) => {
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];

  return (
    <div style={{ minWidth: 1200 }}>
      <Card>
        When you supply your assets into a geVault, you are taking on a market
        limit order position while earning swap fees.
        <br />
        <br />
        When the market price is below the activation price, the geVault is
        denominated in the underlying asset. When the market price is above the
        activation price, the geVault is denominated in the stable asset. The
        geVaults&apos; two main yield-generating streams are the v3 swap fees
        and supply fees from the lending market. The closer the market price of
        the underlying asset in relation to the activation price, the higher v3
        swap fees and supply fees are generated.
        <br />
        <Button
          href="https://goodentry.io/academy"
          target="_blank"
          style={{ marginTop: "10px" }}
        >
          More Details &rarr;
        </Button>
      </Card>
      {vaults.map((vault) => {
        return <VaultPositions vault={vault} key={vault.name} />;
      })}
    </div>
  );
};

export default Farm;
