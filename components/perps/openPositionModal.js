import { Button, Modal, Divider } from "antd";


const OpenPositionModal = ({
    isVisible, 
    setVisible, 
    title, 
    button,
    market,
    side,
    size,
    fundinRate,
    activationPrice
  }) => {
    
  return (
  <Modal 
    open={isVisible}
    onOk={()=>{setVisible(false)}}
    onCancel={()=>{setVisible(false)}}
    width={350}
    footer={null}
    closable={false}
    bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8}}
  >
    Open Position
    <Divider style={{ margin: 10, backgroundColor: '#0ffd6a'}} />
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
      <span style={{color: "#94A3B8", fontSize: "small", fontWeight: 500 }}>Market</span>
      <span style={{fontSize: "small"}}>{market}</span>
    </div>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
      <span style={{color: "#94A3B8", fontSize: "small", fontWeight: 500 }}>Side</span>
      <span style={{ fontSize: "small" }}>{side}</span>
    </div>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
      <span style={{color: "#94A3B8", fontSize: "small", fontWeight: 500 }}>Size</span>
      <span style={{ fontSize: "small"}}>$ {size.toFixed(3)}</span>
    </div>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
      <span style={{color: "#94A3B8", fontSize: "small", fontWeight: 500 }}>Current Hourly Rate</span>
      <span style={{ fontSize: "small"}}>{parseFloat(fundinRate / 365 / 24 ).toFixed(5)}%</span>
    </div>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
      <span style={{color: "#94A3B8", fontSize: "small", fontWeight: 500 }}>Activation Price</span>
      <span style={{fontSize: "small" }}>${activationPrice.toFixed(3)}</span>
    </div>
    <Divider style={{margin: 10}} />
    {button}
  </Modal>
  )
}


export default OpenPositionModal;