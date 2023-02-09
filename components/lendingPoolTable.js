import { Table } from "antd";
import DepositWithdrawalModal from "./depositWithdrawalModal"


export default function LendingPoolTable ({lendingPool, assets, isMinimal}) {
  let columns = [
    { key: "name", dataIndex: "name", title: "Asset", render: (text, record) => <div style={{display: 'flex', alignItems: 'center'}}>
      <img src={record.icon} height={24} style={{marginRight: 5}} alt="tokenImage" />
        {text}
      </div>},
    { key: "apr", dataIndex: "apr", title: "Supply APR", render: (text) => <>{text}%</> },
    { key: "wallet", dataIndex: "wallet", title: "Wallet", render: (text) => <>{parseFloat(text).toFixed(2)}</>, hidden: isMinimal },
    { key: "deposited", dataIndex: "deposited", title: "Deposited", render: (text) => <>{parseFloat(text).toFixed(2)}</> },
    { key: "tlv", dataIndex: "tlv", title: "TLV", render: (text) => <>{parseFloat(text).toFixed(2)}</>, hidden: isMinimal },
    { key: "action", dataIndex: "action", title: "Action",
      render: (_, record) => (
        <DepositWithdrawalModal asset={record} lendingPool={lendingPool} />
      )
    }
  ].filter(item => !item.hidden);
  
  return(
    <>
      <Table 
        dataSource={assets} 
        columns={columns} 
        pagination={false} 
      />
    </>
  )
}