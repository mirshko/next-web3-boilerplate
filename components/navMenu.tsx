// components/layout.js
import { useState, useEffect } from "react";
import { Menu } from "antd"
import { BankOutlined, FrownOutlined, DollarOutlined, DashboardOutlined, SwapOutlined, BugOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const NavMenu = ({bgColor}) =>  {
  const router = useRouter()
  const [current, setCurrent] = useState();
  useEffect ( () => {
    setCurrent(router.pathname)
  }, [router.pathname])

  const onClick = (e) => {
    router.push(e.key);
  };

  const items = [
    { label: 'Vaults', key: '/', icon: <BankOutlined /> },
    //{ label: 'Ranger', key: '/ranger', icon: <BugOutlined /> },
    { label: 'Dashboard', key: '/dashboard', icon: <DashboardOutlined /> },
    { label: 'Protected Farming™', key: '/protectedyield', icon: <DollarOutlined /> },
    { label: 'Protected Perps™', key: '/protectedperps', icon: <SwapOutlined /> },
  ]
  
  return (
    <Menu
      onClick={onClick}
      style={{ backgroundColor: bgColor, borderWidth: 1, minWidth: 570 }}
      defaultSelectedKeys={['1']}
      selectedKeys={[current]}
      defaultOpenKeys={['sub1']}
      mode="horizontal"
      items={items}
    />
  )
}


export default NavMenu;