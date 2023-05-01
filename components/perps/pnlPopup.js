import { useState } from "react";
import { Modal, Divider } from "antd";
import { TwitterOutlined } from "@ant-design/icons";

const PnlPopup = ({ direction, price, token0, pnl, pnlPercent, entry, children }) => {
  const [pnlModalVisible, setPnlModalVisible] = useState();
  
  return (
    <>
      <div 
        onClick={()=>{setPnlModalVisible(true)}}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </div>
      <Modal 
        open={pnlModalVisible} 
        onCancel={()=>{setPnlModalVisible(false)}}
        footer={null}
        bodyStyle={{ padding: 16, backgroundImage: 'url("/images/GEspaceBG.png")'}}
      >
        <img src="/Good Entry Logo.svg" height={28}/>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 'x-large', fontWeight: 600 }}>{token0.name}-USDC</span>
          <div style={{ backgroundColor: direction == "short" > 0 ? "#55d17c" : "#e57673", borderRadius: 4, padding: 2, fontSize: 'x-small' }}>
            {direction.toUpperCase()} 10x
          </div>
          
        </div>
        <span style={{ color: pnl > 0 ? "#55d17c" : "#e57673", fontSize: 'x-large', fontWeight: 'bold' }}>
          {pnl > 0 ? "+" : ""}
          {pnlPercent.toFixed(2)}%
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 12}}>
          <div>
            Entry<br />
            ${entry.toFixed(2)}
          </div>
          <div>
            Market Price<br />
            ${price.toFixed(2)}
          </div>
        </div>
        <Divider style={{ marginBottom: 12}} />
        <div>
          Tell your friends about your trading experience!
          <span style={{ float: 'right'}}>
            <a
              href="https://twitter.com/goodentrylabs"
              target="_blank"
              rel="noreferrer"
            >
              <TwitterOutlined style={{ fontSize: "larger" }} />
            </a>
          </span>
        </div>
      </Modal>
    </>
      )
}

export default PnlPopup;