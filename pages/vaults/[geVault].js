import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { ThunderboltOutlined } from "@ant-design/icons";
import { Card, Typography, Row, Col } from "antd";
import TickChart from "../../components/goodvaults/tickChart";
import StatsChart from "../../components/goodvaults/statsChart";
import GeVaultForm from "../../components/goodvaults/geVaultForm";
import useGeVault from "../../hooks/useGeVault";
import useAddresses from "../../hooks/useAddresses";

const GeVaults = ({}) => {
  const { account } = useWeb3React();
  const router = useRouter()
  let { geVault } = router.query

  const ADDRESSES = useAddresses(geVault);
  let vault = ADDRESSES["lendingPools"][0];
  const gevault = useGeVault(vault);

  const RewardsTag = () => {
    return (<div style={{backgroundColor: "#0A371B", color: "#0FFD6A", borderRadius: 4, padding: "6px 8px", display: 'flex', alignItems: 'center', fontWeight: 600 }}>
      <img src="/logo.svg" height={15} alt='Good Entry Logo' style={{ marginRight:4 }} />
      Rewards
    </div>)
  }
  const VaultTag = () => {
    return (<div style={{backgroundColor: "#0A371B", color: "#0FFD6A", borderRadius: 4, padding: "6px 8px", display: 'flex', alignItems: 'center', fontWeight: 600 }}>
      <ThunderboltOutlined style={{marginRight: 4}}/>
      Rewards
    </div>)
  }

  return (
  <div style={{ marginTop: -25, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw'}}>
    <Card style={{ 
      display: 'flex', justifyContent: 'center',
      width:'100vw',
      padding: 18, borderTop: '3px solid', borderBottom: '3px solid',  borderImageSlice: 1, 
      borderImageSource: 'linear-gradient(to left, rgba(15, 253, 106, 0.29) 0%, rgba(0, 124, 48, 1)  100%)', marginBottom: 48, borderLeft: 0, borderRight: 0,
      boxShadow: `0px 4px 20px rgba(15, 253, 106, 0.5)`
    }}
    >
      <Row style={{ width: 1200}}>
        <Col md={12}>
          <div style={{display: 'flex', gap: 12}}>
          </div>
          <Typography.Title style={{ marginTop: 12 }}>
            {vault.name}
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
    
    <Row style={{ width: 1200 }}>
      <Col
        md={15}
        xs={24}
      >
        <Typography.Title level={2}>
          EzVault Strategy
        </Typography.Title>
        <Typography.Text>There are 2 main ways that this vault earns yield. Firstly, supply apy by providing liquidity for traders to take on leveraged protected perp position(s). Secondly, amm swap fees as the liquidity is deposited into tight ranges in Uniswap. The vault reinvests the yield earned back into the strategy, effectively compounding the yields for users over time.  Users can deposit and withdraw from the ezVault at any point in time..
        </Typography.Text>
        
        <Typography.Title level={2}>Performance</Typography.Title>
        <Card style={{ marginTop: 24, height: 300 }}>
          <StatsChart vault={vault} />
        </Card>
        
        <Typography.Title level={2}>Fee Structure</Typography.Title>
        <Typography.Text>
          There is a one-time deposit and withdraw fee. The base fee is 0.2%.
          <br/>
          Depending on the vault underlying assets imbalance, that fee is automatically adjusted from 0.1% to 0.3%.
        </Typography.Text>
        
        <Typography.Title level={2}>Risk</Typography.Title>
        <Typography.Text>
          The primary risk for running this strategy are similar to a lending market. Good Entry uses a conservative liquidation threshold and a higher reserve factor to manage this risk. 
          <br/><br/>
          The Good Entry ezVault smart contracts have been audited by Peckshield. Despite of this, users are advised to exercise caution and only risk funds that they can afford to lose. 
        </Typography.Text>
      </Col>
      <Col
        md={9}
        xs={24}
      >
        <GeVaultForm vault={vault} />
      </Col>
    </Row>
  </div>)
};

export default GeVaults;