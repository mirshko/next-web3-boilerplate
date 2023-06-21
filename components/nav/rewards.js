import { Button } from "antd";


const Rewards = ({}) => {
  
  
  return (
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
    onClick={()=>{onClick({key: "42161"})}}
  >
    0.0
  </Button>
  )
}

export default Rewards;