import Link from "next/link";
import { useRouter } from 'next/router'

import LendingPoolTable from "../../components/lendingPoolTable";
import { Table } from 'antd';

import useAssetData from "../../hooks/useAssetData";


function Home() {
  const router = useRouter();
  const { vaultAddress } = router.query
  console.log('rvault pid', vaultAddress)
  
  const LENDING_POOL = vaultAddress ?? "0x4D39CBBf7368a68F62AD1a1a0aB873044A7c5ee1"
  var eth = useAssetData("ETH", LENDING_POOL)
  var usdc = useAssetData("USDC", LENDING_POOL)
  
  var assets = [
    { key: 0, ...eth },
    { key: 1, ...usdc },
    { key:2, name: "ETH-USDC-LP UNIv2", apr: 5, wallet: 0, deposited: 0, tlv: 0 },
    { key:3, name: "ETH-USDC-LP UNIv3", apr: 5, wallet: 0, deposited: 0, tlv: 0, target: "/ranger" },
  ];
  
  
  
  return (
    <div>
      <h1>
        Earn - ETH-USDC vault &or;
      </h1>

      
      <div className="grid">
        <article>
        </article>
        <article>
        </article>
      </div>
    </div>
  );
}

export default Home;
