import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { Card, Typography, Row, Col } from "antd";
import GeVaultForm from "../../components/geVaultForm";
import useAddresses from "../../hooks/useAddresses";

const GeVaults = ({}) => {
  const { account } = useWeb3React();
  const router = useRouter()
  let { geVault } = router.query

  const ADDRESSES = useAddresses(geVault);
  let vault = ADDRESSES["lendingPools"][0];
  console.log(vault)
  

  return (
  <div style={{ width: 1200}}>
    <div>
      <Typography.Title>
        Vault {vault.name}
      </Typography.Title>
    </div>
    
    <Row gutter={64}>
      <Col
        md={12}
        xs={24}
      >
        <Card>
          What is it?
        </Card>
      </Col>
      <Col
        md={8}
        xs={24}
      >
        <GeVaultForm vault={vault} />
      </Col>
    </Row>
  </div>)
};

export default GeVaults;