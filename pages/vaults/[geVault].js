import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { Card, Typography, Row, Col } from "antd";
import GeVaultForm from "../../components/geVaultForm";
import useGeVault from "../../hooks/useGeVault";
import useAddresses from "../../hooks/useAddresses";

const GeVaults = ({}) => {
  const { account } = useWeb3React();
  const router = useRouter()
  let { geVault } = router.query

  const ADDRESSES = useAddresses(geVault);
  let vault = ADDRESSES["lendingPools"][0];
  const gevault = useGeVault(vault);

  return (
  <div style={{ width: 1200}}>
    <Card style={{ padding: 18, borderTop: '5px solid', borderBottom: '5px solid',  borderImageSlice: 1, 
    borderImageSource: 'linear-gradient(to left, rgba(22,104,220,1) 0%, rgba(229,118,115,1)  100%)', marginBottom: 48, borderLeft: 0, borderRight: 0

    }}>
      <Row>
        <Col md={12}>
          <Typography.Title style={{ marginTop: 12 }}>
            Vault {vault.name}
          </Typography.Title>
          <div style={{ width: '350px', marginTop: 12}}>
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
              <span>Current Deposits</span>
              <span>${parseFloat(gevault.tvl).toFixed(0)}</span>
            </div>
            <div style={{ backgroundColor: '#aaa', marginTop: 8, marginBottom: 8}}>
              <div style={{ backgroundColor: '#4bb56c', height: 10, width: Math.round(100 * gevault.tvl / gevault.maxTvl)}}>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
              <span>Max. Capacity</span>
              <span>${gevault.maxTvl}</span>
            </div>
          </div>
        </Col>
        <Col md={12}>
          <img src={gevault.icon} height={64} style={{ float: 'right'}}/>
        </Col>
      </Row>
    </Card>
    
    <Row gutter={96}>
      <Col
        md={14}
        xs={24}
      >
        <Typography.Title level={2}>
          Good Vault Strategy
        </Typography.Title>
        <Typography.Text>Good Vaults hold assets used for leverage trading. They also earn fees by depositing the liquidity in tight ranges in Uniswap.
        <br/><br/>
        Rebalancing moves the underlying vaults assets in the adequate price ranges. This process is permissionless, lossless, and doesn&apos;t incur any swap fees or management fees.
        </Typography.Text>
        <Card style={{ marginTop: 24 }}>
          Explanation Chart
        </Card>
        <Card style={{ marginTop: 24 }}>
          Performance Chart
        </Card>
      </Col>
      <Col
        md={10}
        xs={24}
      >
        <GeVaultForm vault={vault} />
      </Col>
    </Row>
  </div>)
};

export default GeVaults;