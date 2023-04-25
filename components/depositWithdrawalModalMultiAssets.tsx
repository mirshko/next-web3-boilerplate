import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Tabs, Input, Spin, Checkbox, Divider, Tag, Dropdown } from "antd";
import { UploadOutlined, DownloadOutlined, DownOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import useLendingPoolContract from "../hooks/useLendingPoolContract";
import useTokenContract from "../hooks/useTokenContract";
import useETHBalance from "../hooks/useETHBalance";
import useAssetData from "../hooks/useAssetData";
import useWethGateway from "../hooks/useWethGateway";
import { useWeb3React } from "@web3-react/core";
import TxIcon from "./txIcon";
import { useTxNotification } from "../hooks/useTxNotification";

const DepositWithdrawalModalMultiAssets = ({ vault }) => {
  const [isVisible, setVisible] = useState(false)
  const [inputValue, setInputValue] = useState("0");
  const [lpAllowance, setLpAllowance] = useState(ethers.constants.Zero);
  const [isSpinning, setSpinning] = useState(false);
  const [action, setAction1] = useState("Deposit");
  const [runningTx, setRunningTx] = useState(0);
  const [errorTx, setErrorTx] = useState(false);
  const [approveWhat, setApproveWhat] = useState("");

  const router = useRouter();
  const { account, chainId } = useWeb3React();
  const ethBalance = useETHBalance(account).data / 1e18;

  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();

  const token0 = useAssetData(vault ? vault.token0.address : null, vault.address)
  if (token0.name == "WETH") token0.name = "ETH"
  const token1 = useAssetData(vault ? vault.token1.address : null, vault.address)
  const [asset, setAsset1] = useState(token0)
  const setAction = (a) => {
    setRunningTx(0);
    setAction1(a);
  }
  const setAsset = (a) => {
    setRunningTx(0);
    setAsset1(a);
  }
  
  useEffect(()=>{
    setAsset1(token0)
  }, [vault.name])

  const lendingPoolContract = useLendingPoolContract(vault.address);
  const wethGateway = useWethGateway();

  const goTxGo = async (action) => {
    setRunningTx(1);
    setSpinning(true);
    setErrorTx(false);
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    try {
      if (action == "Deposit") {
        if (asset.name == "ETH") {
          let result = await wethGateway.depositETH(vault.address, account, 0, {
            value: ethers.utils.parseUnits(inputValue, 18),
          });
        } else {
          setApproveWhat("the lending pool");
          let result = await asset.contract.allowance(account, vault.address);
          if (result.lt(ethers.utils.parseUnits(inputValue, asset.decimals))) {
            setRunningTx(1);
            result = await asset.contract.approve(
              vault.address,
              ethers.utils.parseUnits(inputValue, asset.decimals)
            );
            for (let k = 0; k< 20; k++){
              let allowance = await asset.contract.allowance(account, vault.address);
              if ( allowance.gte(ethers.utils.parseUnits(inputValue, asset.decimals)) ) break;
              await delay(2000);
            }
          }
          setRunningTx(2);
          result = await lendingPoolContract.deposit(
            asset.address,
            ethers.utils.parseUnits(inputValue, asset.decimals),
            account,
            0
          );

          showSuccessNotification(
            "Assets deposited",
            "Assets deposited successful",
            result.hash
          );
        }

        setRunningTx(3);
        //closeModal()
      } else if (action == "Withdraw") {
        if (asset.name == "ETH") {
          // give aWETH allowance to wethGateway
          setApproveWhat("the WETH gateway");
          let result = await asset.roeContract.allowance(
            account,
            wethGateway.address
          );
          
          if (result.lt(ethers.utils.parseUnits(inputValue, asset.decimals))) {
            setRunningTx(1);
            result = await asset.roeContract.approve(
              wethGateway.address,
              ethers.constants.MaxUint256
            );
            for (let k = 0; k< 20; k++){
              let allowance = await asset.roeContract.allowance(account, wethGateway.address);
              if ( allowance.gte(ethers.utils.parseUnits(inputValue, asset.decimals)) ) break;
              await delay(2000);
            }
          }
          setRunningTx(2);
          await wethGateway.withdrawETH(
            vault.address,
            ethers.utils.parseUnits(inputValue, asset.decimals),
            account
          );
        } else {
          setRunningTx(2);
          let result = await lendingPoolContract.withdraw(
            asset.address,
            ethers.utils.parseUnits(inputValue, asset.decimals),
            account
          );

          showSuccessNotification(
            "Assets withdrawn",
            "Assets withdrawn successful",
            result.hash
          );
        }

        setRunningTx(3);
        //closeModal()
      }
    } catch (e) {
      setErrorTx(true);
      console.log(e.message);
      showErrorNotification(e.code, e.reason);
    }
    setSpinning(false);
  };

  var actionComponent = action;
  var assetBal = action == "Withdraw" ? asset.deposited : (asset.name == "ETH" ? ethBalance : asset.wallet);
          
  const items = [
    {
      key: '1',
      label: token0.name,
      onClick: (e) => {setAsset(token0)}
    },
    {
      key: '2',
      label: token1.name,
      onClick: (e) => {setAsset(token1)}
    }
  ]

  return (
    <>
      <div>
        <Button type="primary" style={{ marginRight:8}} size="small" onClick={()=>{setAction("Deposit"); setVisible(true)}}>Deposit</Button>
        <Button size="small" onClick={()=>{setAction("Withdraw"); setVisible(true)}}>Withdraw</Button>
      </div>
      <Modal
        open={isVisible}
        onOk={()=>{setVisible(false)}}
        onCancel={()=>{setVisible(false)}}
        width={400}
        footer={null}
      >
        <div style={{marginBottom: 24, marginTop: 24}}>
          <Button
            type={action == "Deposit" ? "primary" : "default"}
            style={{ width: "50%", textAlign: "center", borderRadius: "4px 0 0 4px" }}
            onClick={() => {
              setAction("Deposit");
            }}
          >
            <strong><DownloadOutlined /> Deposit</strong>
          </Button>
          <Button
            type={action == "Withdraw" ? "primary" : "default"}
            style={{ width: "50%", textAlign: "center", borderRadius: "0 4px 4px 0" }}
            onClick={() => {
              setAction("Withdraw");
            }}
          >
            <strong><UploadOutlined /> Withdraw</strong>
          </Button>      
        </div>
        <span>Asset</span>
        <Dropdown menu={{items, selectable: true, defaultSelectedKeys: ['1'],}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: "#1D2329", borderRadius: 4, padding: 8 }}>
            <span>{asset.name}</span>
            <DownOutlined />
          </div>
        </Dropdown>
        <div className="formDiv" style={{ marginTop: 24 }}>
          {contextHolder}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span>Amount</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setInputValue(assetBal);
              }}
            >
              {action == "Deposit" ? "Wallet" : "Available"}:{" "}
              {parseFloat(assetBal).toFixed(5)}
            </span>
          </div>
          <Input
            type="number"
            style={{ width: "100%", marginBottom: 20 }}
            min={0}
            max={assetBal}
            onChange={(e) => setInputValue(e.target.value)}
            key="inputamount"
            value={inputValue}
            suffix={
              <>
                <Tag
                  onClick={() => {
                    setInputValue(asset.name == "ETH" && action == "Deposit" ? ethBalance : assetBal);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span style={{ fontSize: "x-small" }}>MAX</span>
                </Tag>
                <img src={asset.icon} width={18} alt="tokenIcon" />
                &nbsp;{asset.name}
              </>
            }
          />

          <Button
            type={isSpinning ? "default" : "primary"}
            style={{ width: "100%", marginTop: 16 }}
            onClick={() => goTxGo(action)}
            disabled={
              !inputValue ||
              parseFloat(inputValue) == 0 ||
              parseFloat(inputValue) > parseFloat(assetBal)
            }
          >
            {isSpinning ? <Spin /> : <>{actionComponent}</>}
          </Button>

          {runningTx > 0 ? (
            <>
              <Divider orientation="left">Execute</Divider>
              <div>
                Allow {approveWhat}
                <TxIcon index={1} runningTx={runningTx} errorTx={errorTx} />
              </div>
              <div>
                {action}
                <TxIcon index={2} runningTx={runningTx} errorTx={errorTx} />
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default DepositWithdrawalModalMultiAssets;
