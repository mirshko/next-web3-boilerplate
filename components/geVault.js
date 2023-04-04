import { useState } from "react";
import { Card, Col } from "antd";
import { useRouter } from 'next/router';

const GeVault = ({ vault }) => {
  const [highlightBox, setHighlightBox] = useState(false);
  const router = useRouter();
  
  if (!vault.geVault) return <></>  
  
  return (
    <Col
      md={6}
      xs={24}
      style={{ marginBottom: 24, cursor: "pointer" }}
      onMouseOver={() => {
        setHighlightBox(true);
      }}
      onMouseOut={() => {
        setHighlightBox(false);
      }}
      onClick={()=>{router.push("/vaults/"+vault.name)}}
    >
      <Card>
        {vault.name}
      </Card>
    </Col>
  
  )
}
  
export default GeVault;