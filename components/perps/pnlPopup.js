import { useState, useRef } from "react";
import { Modal, Divider } from "antd";
import { TwitterOutlined, DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";

const PnlPopup = ({ direction, price, token0, pnl, pnlPercent, entry, children }) => {
  const [pnlModalVisible, setPnlModalVisible] = useState();
  const exportRef = useRef();
  
  const exportAsImage = async (element, imageFileName) => {
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL("image/png", 1.0);
    downloadImage(image, imageFileName);
    };
const downloadImage = (blob, fileName) => {
    const fakeLink = window.document.createElement("a");
    fakeLink.style = "display:none;";
    fakeLink.download = fileName;

    fakeLink.href = blob;

    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);

    fakeLink.remove();
  };

  
  
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
      >
      <div id="sharePnl"  ref={exportRef} style={{ padding: 16, backgroundImage: 'url("/images/GEspaceBG.png")' }}>
        <img src="/Good Entry Logo.svg" height={28}/>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 'x-large', fontWeight: 600 }}>{token0.name}-USDC</span>
          <div style={{ backgroundColor: direction == "short" > 0 ? "#55d17c" : "#e57673", color: 'white', borderRadius: 4, padding: 2, fontSize: 'x-small' }}>
            {direction.toUpperCase()} 10x
          </div>
          
        </div>
        <span style={{ color: pnl > 0 ? "#55d17c" : "#e57673", fontSize: 'x-large', fontWeight: 'bold' }}>
          {pnl > 0 ? "+" : ""}
          {(pnlPercent * 10).toFixed(2)}%
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
              onClick={() => exportAsImage(exportRef.current, "GoodEntry-"+(new Date().getTime()))}
            >
              <DownloadOutlined style={{ fontSize: "larger" }} />
            </a>
          </span>
          <span style={{ float: 'right', marginRight: 12}}>
            <a
              href="https://twitter.com/goodentrylabs"
              target="_blank"
              rel="noreferrer"
            >
              <TwitterOutlined style={{ fontSize: "larger" }} />
            </a>
          </span>
        </div>
      </div>
      </Modal>
    </>
      )
}

export default PnlPopup;