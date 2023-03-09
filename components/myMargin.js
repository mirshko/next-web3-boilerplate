import useTheme from '../hooks/useTheme'

const MyMargin = ({value}) => {
  const theme = useTheme()
  
  var extraStyle = {color: '#55d17c'}
  if (parseFloat(value) > 90) extraStyle.color = theme.volcano
  if (parseFloat(value) > 70) extraStyle.color = theme.gold
  
  return (
    <span style={extraStyle}>{parseFloat(value).toFixed(2)}%</span>
  )
}

export default MyMargin;