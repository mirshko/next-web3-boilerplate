import { Table, Button } from "antd";
import DepositWithdrawalModal from "./depositWithdrawalModal"


export default function LendingPoolTable ({lendingPool, assets, isMinimal}) {
  let columns = [
    { key: "name", dataIndex: "name", title: "Asset", render: (text, record) => <div style={{display: 'flex', alignItems: 'center'}}>
      <img src={record.icon} height={24} width={24} style={{marginRight: 5}} alt="tokenImage" />
        {text}
      </div>},
    { key: "supplyApr", dataIndex: "supplyApr", title: "Supply APR", render: (text) => <>{text}%</> },
    { key: "wallet", dataIndex: "wallet", title: "Wallet", render: (text) => <>{parseFloat(text).toFixed(2)}</>, hidden: isMinimal },
    { key: "deposited", dataIndex: "deposited", title: "Deposited", render: (text) => <>{parseFloat(text).toFixed(2)}</> },
    { key: "tlv", dataIndex: "tlv", title: "TLV", render: (text) => <>{parseFloat(text).toFixed(2)}</>, hidden: isMinimal },
    { key: "action", dataIndex: "action", title: "Action",
      render: (_, record) => {
        if (record.type == 'single') return (<DepositWithdrawalModal asset={record} vault={lendingPool} />)
        else return (<Button href="/dashboard">Go to Dashboard</Button>)
      }
    }
  ].filter(item => !item.hidden);

  
  return(
    <>
      <Table 
        key='dataIndex'
        dataSource={assets} 
        columns={columns} 
        pagination={false} 
        rowKey="name" 
      />
    </>
  )
}