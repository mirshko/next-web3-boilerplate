// components/layout.js
import { useState, useEffect } from "react";
import { Menu } from "antd";
import {
  BankOutlined,
  FrownOutlined,
  DollarOutlined,
  DashboardOutlined,
  SwapOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

const NavMenu = ({ bgColor }) => {
  const router = useRouter();
  const [current, setCurrent] = useState();
  useEffect(() => {
    setCurrent(router.pathname);
  }, [router.pathname]);

  const onClick = (e) => {
    router.push(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      style={{ backgroundColor: bgColor, borderWidth: 1, minWidth: 500 }}
      defaultSelectedKeys={["1"]}
      selectedKeys={[current]}
      defaultOpenKeys={["sub1"]}
      mode="horizontal"
      
    >
      <Menu.Item key="/"><SwapOutlined /> Protected Perps</Menu.Item>
      <Menu.Item key="/ezvaults"><BankOutlined /> ezVaults</Menu.Item>
      <Menu.Item key="https://goodentry.io/staking"><FundOutlined  /> Staking</Menu.Item>
      <Menu.Item key="/dashboard"><DashboardOutlined   /> Dashboard</Menu.Item>
    </Menu>
  );
};

export default NavMenu;
