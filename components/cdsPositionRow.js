import { Button } from 'antd'
import useAssetData from '../hooks/useAssetData'


const CdsPositionRow = ({vault, assetAddress}) => {
  const asset = useAssetData(assetAddress)
  
  if ( asset.deposited == 0) return <></>
  
  return (<>
    <tr>
      <td>{asset.name}</td>
      <td>{asset.deposited}</td>
      <td>0</td>
      <td>0</td>
      <td><Button>Close</Button></td>
    </tr>
  </>)
}


export default CdsPositionRow;