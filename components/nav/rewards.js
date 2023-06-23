import { useState } from "react";
import { Button, Modal } from "antd";
import useRewards from "../../hooks/useRewards";

const Rewards = ({}) => {
  const rewards = useRewards();
  console.log(rewards)
  const [visible, setVisible] = useState();
  
  return (
  <>
    <Button
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
        gap: 8
      }}
      icon=<img src="/icons/good.svg" 
            height={16}
            width={16}
            alt="Good Token" />
      onClick={()=>{setVisible(true)}}
    >
      {rewards.user_good ? (rewards.user_good).toFixed(2) : 0.0 }
    </Button>
    <Modal 
      title="GOOD Rewards"
      open={visible} onOk={()=>{setVisible(false)}} onCancel={()=>{setVisible(false)}}
      footer={null}
      >
      50M $GOOD rewards will be airdropped after a 4 months liquidity mining program.
    </Modal>
  </>
  )
}

export default Rewards;