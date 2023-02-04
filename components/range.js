import {useState} from "react";
import { Card, Row, Col, Divider, theme} from "antd";
  const { useToken } = theme;
import getRangeData from "../hooks/getRangeData";
import RedeemRangeModal from "../components/redeemRangeModal";


export default function Range ({address, priceRange, yields, available, bordered, onClick, lendingPool}) {
  const { token } = useToken();
  var asset = getRangeData(address, lendingPool)
  let title = priceRange == "Full" ? "Full Range" : "Range: $"+priceRange


  // horizontal boxes format
  return (
    <Card style={{borderColor: bordered ? token.colorPrimary : 'darkgrey', borderWidth: 2 }} bodyStyle={{ padding: 16}}  onClick={onClick}>
      <strong>{title}</strong>
      <Row gutter={2} justify="space-between">
        <Col>1 Week (1x)<br />{yields ? yields.week : 0 }%</Col>
        <Col>1 Week (10x)<br />{yields ? yields.week * 10 : 0 }%</Col>
      </Row>
      {/*<Divider />
      Current position: {asset.deposited}
      { asset.deposited > 0 && <RedeemRangeModal asset={asset} /> } */}
    </Card>
  )
  
}