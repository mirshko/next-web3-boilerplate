import {useState} from "react";
import { Card, Row, Col, Divider, theme} from "antd";
  const { useToken } = theme;
import useAssetData from "../hooks/useAssetData";
import RedeemRangeModal from "../components/redeemRangeModal";


export default function Range ({address, priceRange, yields, available, bordered, onClick, lendingPool}) {
  const { token } = useToken();
  var asset = useAssetData(address, lendingPool)
  let title = priceRange == "Full" ? "Full Range" : "Range: $"+priceRange

  if (!asset) return <></>

  // horizontal boxes format
  return (
    <Card style={{borderColor: bordered ? token.colorPrimary : 'darkgrey', borderWidth: 2 }} bodyStyle={{ padding: 16}}  onClick={onClick}>
      <strong>{title}</strong>
      <Row gutter={2} justify="space-between">
        <Col><span style={{ fontSize: 'small', color: 'grey'}}>24h (1x)</span><br />{(parseFloat(asset.baseApr)+parseFloat(asset.supplyApr)).toFixed(2)}%</Col>
        <Col>
          <span style={{ fontSize: 'small', color: 'grey'}}>24h (10x)</span><br />
          <span style={{color: 'lightgreen', fontWeight: 'bold'}}>{( 10*(parseFloat(asset.baseApr)+parseFloat(asset.supplyApr)) ).toFixed(2)}%</span>
        </Col>
      </Row>
      {/*<Divider />
      Current position: {asset.deposited}
      { asset.deposited > 0 && <RedeemRangeModal asset={asset} /> } */}
    </Card>
  )
  
}