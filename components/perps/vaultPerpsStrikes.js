import useAssetData from '../../hooks/useAssetData';

const VaultPerpsStrikes = ({ address, vault, onClick, isSelected }) => {
  const asset = useAssetData(address, vault.address)
  
  var style = {
      cursor: 'pointer',
    }
  if (isSelected) style = {
    backgroundColor: 'rgba(255,255,255,0.2',
    padding: 4,
    ...style
  }

  return (
    <div onClick={() => { onClick({price: asset.price, address: asset.address}); }}
      style={style}
    >
      {asset.price}
        {/*<span>{parseFloat(asset.tlv).toFixed(0)}</span>*/}
      <span style={{ float: 'right'}}>{(asset.debtApr / 365 / 24).toFixed(4)}%</span>
    </div>
  )
}

export default VaultPerpsStrikes;