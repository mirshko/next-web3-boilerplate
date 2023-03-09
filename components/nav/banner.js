
import { useState } from 'react'
import { NotificationOutlined, CloseOutlined } from '@ant-design/icons'

const Banner = () => {
  const [hideBanner, setHideBanner] = useState()
  
  return (
    <div style={{ 
      background: `linear-gradient(65deg, rgba(22,104,220,1) 0%, rgba(229,118,115,1)  100%)`,
      color: 'white',
      fontSize: 'smaller',
      display: hideBanner ? 'none' : 'flex', flexDirection: 'row', alignItems: 'center', flex: '0 0 100%', padding: '4px 24px' }} 
    >
      <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 12, padding: '4px 8px', borderRadius: 8 }}>
        <NotificationOutlined style={{  }}/>
      </div>
      GoodEntry is in alpha mode. Join our&nbsp; <a href='https://discord.gg/7rCQCZV9YR' target="_blank" rel="noreferrer" style={{ color: 'white'}}>Discord</a> &nbsp;for news and rewards!
      <CloseOutlined style={{ float: 'right', marginLeft: 'auto', fontSize: 'larger' }} onClick={()=>{setHideBanner(true)}}/>
    </div>
  )
}

export default Banner;