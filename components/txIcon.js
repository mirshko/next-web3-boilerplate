import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, HourglassOutlined, LoadingOutlined, ExclamationCircleOutlined, ForkOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons";
import useTheme from "../hooks/useTheme"

const TxIcon = ({index, runningTx, errorTx}) => {
  const theme = useTheme()

  if (index == runningTx) 
    return (errorTx ? <ExclamationCircleOutlined  style={{float: 'right', color: theme.colorError}} /> : <LoadingOutlined style={{float: 'right'}} />)
  if (index < runningTx) 
    return <CheckCircleOutlined style={{color: theme.colorSuccess, float: 'right'}} />
  if (index > runningTx) 
    return <HourglassOutlined style={{color: theme.colorWarning, float: 'right'}} />

  return <></>
}

export default TxIcon;