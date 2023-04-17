// components/layout.js
import Head from "next/head";
import Link from "next/link";
import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ['latin'] })
import { Layout, Menu, theme } from 'antd';
import NavRight from './nav/navRight';
import NavMenu from './nav/navMenu';
import Banner from './nav/banner';
const { useToken } = theme;

const MyLayout = ({ children }) =>  {
  const { token } = useToken();
  
  return (
  <div className={inter.className}>
    <Banner />
    <Layout style={{ display: 'flex', alignItems: 'center', minHeight: '100vh'
      }}>
        <Layout.Header 
          style={{ 
            backgroundColor: token.colorBgBase,
            width: '100%', alignItems: 'center',
            borderBottom: '1px solid #475569',
            display: 'flex', justifyContent: 'center'
          }}>
          <div style={{width: 1400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center'}}>
              <img src="/Good Entry Logo.svg" height={30} alt='Good Entry Logo' style={{ marginRight: 24}} />
              <NavMenu bgColor={ token.colorBgBase } />
            </div>
            <NavRight />
          </div>
        </Layout.Header>

        <Layout.Content style={{ margin: '24px 0' }}>
          {children}
        </Layout.Content>

          
        <Layout.Footer>
        </Layout.Footer>

    </Layout>
  </div>
  )
}


export default MyLayout;