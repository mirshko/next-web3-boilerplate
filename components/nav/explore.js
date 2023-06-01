import { Popover, Button } from "antd";

const Explore = ({}) => {
  
  return (
    <Popover content={content} title="Title" trigger="hover">
      <Button>Hover me</Button>
    </Popover>
  )
}

export default Explore;