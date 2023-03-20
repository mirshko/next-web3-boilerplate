import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Checkbox,
  Button,
  Tooltip,
} from "antd";
const { Column, ColumnGroup } = Table;
import useAddresses from "../hooks/useAddresses";
import useAssetData from "../hooks/useAssetData";
import DepositWithdrawalModal from "./depositWithdrawalModal";
import DepositWithdrawalTickerModal from "./depositWithdrawalTickerModal";
import CloseDebt from "./closeDebt";
import CloseTrPositionButton from "./closeTrPositionButton";
import { ethers } from "ethers";

/**
  Displays user positions in a vault
  That includes:
    - single assets
    - LPv2 positions (whether supply or debt)
    - Rangers (supply or debt)
*/
const VaultPositionsRow = ({ assetAddress, vault, hideEmpty }) => {
  const [assets, setAssets] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const ADDRESSES = useAddresses();
  const asset = useAssetData(assetAddress, vault.address);

  if (hideEmpty && asset.deposited == 0 && asset.debt == 0) return <></>;
  const columns = [
    { key: "asset", title: "Position", dataIndex: "name" },
    { key: "deposited", title: "Balance", dataIndex: "deposited" },
    { key: "debt", title: "Debt", dataIndex: "debt" },
    { key: "pnl", title: "PnL", dataIndex: "pnl" },
    { key: "action", dataIndex: "action", title: "Action" },
  ];

  if (asset.type == "single")
    asset.depositedAction = (<>
      <DepositWithdrawalModal
        asset={asset}
        vault={vault}
        setVisible={setModalVisible}
        isVisible={isModalVisible}
      />
      <Button size="small" onClick={()=>{setModalVisible(true)}}>
        Deposit / Withdraw
      </Button>
    </>
    );
  else if (asset.type == "ticker") {
    asset.depositedAction = (
    <>
      <DepositWithdrawalTickerModal
        asset={asset}
        vault={vault}
        opmAddress={ADDRESSES["optionsPositionManager"]}
        setVisible={setModalVisible}
        isVisible={isModalVisible}
      />
      <Button size="small" onClick={()=>{setModalVisible(true)}}>
        Deposit / Withdraw
      </Button>
    </>
    );
    asset.debtAction = (
      <>
        <Button size="small" href={"/protectedperps/"}>
          Protected Perps
        </Button>
      </>
    );
  }

  return (<>
    <tr>
      <td>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={asset.icon} height={24} alt={asset.name.toLowerCase()} />&nbsp;
          {asset.name}
        </div>
      </td>
      <td align="right">{asset.deposited == 0 ? <>0</> : parseFloat(asset.deposited).toFixed(6)}</td>
      <td align="right">{(parseFloat(asset.supplyApr) + parseFloat(asset.feeApr)).toFixed(2)} %</td>
      <td align="right">{asset.depositedAction}</td>
  </tr></>)
};

export default VaultPositionsRow;
