import { Row, Col, Card, Typography } from "antd";
import PriceChart from "../components/stats/priceChart";
import useGoodStats from "../hooks/useGoodStats";
import useAddresses from "../hooks/useAddresses";

const Stats = ({}) => {
  const goodStats = useGoodStats();
  const ADDRESSES = useAddresses();
  let vaults = ADDRESSES["lendingPools"];
  
  
  return (
  <>
    <Typography.Title>Good Stats</Typography.Title>
    
    <Row guttern={48}>
      <Col md={12}>
        
      </Col>
      <Col md={12}>
        {
          vaults.map( vault => {
            return vault.geVault.map( gev => {
              return (
                <PriceChart key={gev.address} vault={vault} gevault={gev} showPriceNotFees={true} />
              )
            })
          })
          
        }
      </Col>
    </Row>
  </>
  )
}

export default Stats;