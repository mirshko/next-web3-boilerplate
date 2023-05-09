import { Slider as ASlider } from "antd";
import useTheme from "../../hooks/useTheme";


const Slider = (props) => {
  const theme = useTheme();
  console.log(theme)
  console.log(theme.colorPrimary + ' !important', {...props})
  
  return (
    <ASlider
      {...props} 
      style={{ width: '100%', ...props.style }}
      handleStyle={{ backgroundColor: '#13161A' }}
    />
  )
}

export default Slider;