const DesignIcon = ({icon, height, alt}) => {
  
  const h = height ?? 164;
  
  return (
    <div style={{ borderRadius: h/2, border: '1px solid #0FFD6A', width: h, height: h, margin: 'auto', backgroundColor: '#020D0D',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
      <img src={icon} height={h / 4} width={h/4} alt={alt} />
    </div>
  )
  
}

export default DesignIcon;