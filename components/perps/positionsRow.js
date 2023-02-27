import { useEffect } from 'react'
import useAssetData from '../../hooks/useAssetData'
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import CloseTrPositionButton from '../closeTrPositionButton'
import useAddresses from '../../hooks/useAddresses';

const PositionsRow = ({address, vault, price, addPosition }) => {
  const asset = useAssetData(address)
  const tokenAmounts = useUnderlyingAmount(address, vault)
  
  if (asset.debt == 0) return <></>

  let amount0 = tokenAmounts.amount0 * asset.debt
  let amount1 = tokenAmounts.amount1 * asset.debt
  
  addPosition({name: vault.name, price: asset.price})

  
  // here we should get information about when the user opened the position
  // maybe store the event in the browser, or look for the past event opening that position to see 
  
  return (
  <tr key={asset.address}>
    <td>Strike {asset.price}</td>
    <td>
      {amount0 > 0 && <>{amount0} {vault.token0.name}</> }
      {amount1 > 0 && <>{amount1} {vault.token1.name}</> }
    </td>
    <td align='right'>{ (asset.debtApr / 365 / 24).toFixed(4) }%</td>
    <td align='right'>0</td>
    <td align='right'>
      <CloseTrPositionButton address={address} vault={vault} />
    </td>
  </tr>
  )
  
}


export default PositionsRow;