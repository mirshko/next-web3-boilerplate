import { useState } from "react";
import { Card, Button, Input, Spin, Divider, Dropdown } from "antd";
import {DownloadOutlined, UploadOutlined, DownOutlined } from "@ant-design/icons"
import { useWeb3React } from "@web3-react/core";
import useGeVault from "../../hooks/useGeVault";
import useAssetData from "../../hooks/useAssetData";
import useTokenContract from "../../hooks/useTokenContract";
import { useTxNotification } from "../../hooks/useTxNotification";
import useETHBalance from "../../hooks/useETHBalance";
import { ethers } from "ethers";


/// Asserts that ETH is always token0 (as per arbitrum)
const GeVaultForm = ({vault, gevault}) => {
  if (vault.token0.name == "WETH") vault.token0.name = "ETH";
  const { account, chainId } = useWeb3React();
  const [direction, setDirection] = useState("Deposit");
  const [token, setToken] = useState(vault.token0.name)
  const [inputValue, setInputValue] = useState()
  const [isSpinning, setSpinning] = useState(false);
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();
  const geVault = useGeVault(vault, gevault);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  
  const ethBalance = useETHBalance(account).data / 1e18;
  const assetData = useAssetData(vault.token0.name == token ? vault.token0.address : vault.token1.address, vault.address);
  const tokenContract = useTokenContract(assetData.address);

  // if deposit token0 or withdraw token1, fee is fee0
  var operationFee = geVault.fee1;
  if ( (direction == "Deposit" && token == vault.token0.name) || (direction == "Withdraw" && token == vault.token1.name) ) operationFee = geVault.fee0;
  var balance = geVault.wallet;
  if (direction == "Deposit") {
    if( token == "ETH" ) balance = ethBalance
    else balance = assetData.wallet
  }

  const isButtonDisabled = !inputValue || parseFloat(inputValue) > balance || (geVault.status == "Withdraw Only" && direction == "Deposit") || chainId != 42161
    
  const deposit = async () => {
    setSpinning(true);
    try {
      if (chainId != 42161) throw new Error("Invalid Chain")
      let result;
      if (token == "ETH"){
        result = await geVault.contract.deposit(assetData.address, 0, {value: ethers.utils.parseUnits(inputValue, 18)});
      }
      else {
        // check allowance
        result = await tokenContract.allowance(account, geVault.address);
        if ( 
            result.lt(
              ethers.utils.parseUnits(inputValue, assetData.decimals)
            )
          ) {
            result = await tokenContract.approve(
              geVault.address,
              ethers.constants.MaxUint256
            );
            await delay(8000);
          }
        result = await geVault.contract.deposit(assetData.address, ethers.utils.parseUnits(inputValue, assetData.decimals));
      }
      showSuccessNotification(
        "Assets deposited",
        "Assets deposited successful",
        result.hash
      );
    }
    catch(e){
      console.log("Error withdrawing", e.message);
      showErrorNotification(e.code, e.reason);
    }
    setSpinning(false);
  }
  
  
  const withdraw = async () => {
    setSpinning(true);
    try {
      let result = await geVault.contract.withdraw(ethers.utils.parseUnits(inputValue, 18), assetData.address);
      showSuccessNotification(
        "Assets withdrawn",
        "Assets withdrawn successful",
        result.hash
      );
    }
    catch(e){
      console.log("Error withdrawing", e.message);
      showErrorNotification(e.code, e.reason);
    }
    setSpinning(false);
  }
  
  const items = [
    {
      key: '1',
      label: vault.token0.name,
      onClick: (e) => {setToken(vault.token0.name)}
    },
    {
      key: '2',
      label: vault.token1.name,
      onClick: (e) => {setToken(vault.token1.name)}
    }
  ]
  
  
  return(<Card style={{marginLeft: 64, color: 'white'}}>
    {contextHolder}
    <div style={{marginBottom: 24}}>
      <Button
        type={direction == "Deposit" ? "primary" : "default"}
        style={{ width: "50%", textAlign: "center", borderRadius: "4px 0 0 4px" }}
        onClick={() => {
          setDirection("Deposit");
        }}
      >
        <strong><DownloadOutlined /> Deposit</strong>
      </Button>
      <Button
        type={direction == "Withdraw" ? "primary" : "default"}
        style={{ width: "50%", textAlign: "center", borderRadius: "0 4px 4px 0" }}
        onClick={() => {
          setDirection("Withdraw");
        }}
      >
        <strong><UploadOutlined /> Withdraw</strong>
      </Button>      
    </div>
    
    <span>Asset</span>
    <Dropdown menu={{items, selectable: true, defaultSelectedKeys: ['1'],}}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: "#1D2329", borderRadius: 4, padding: 8 }}>
        <span>{token}</span>
        <DownOutlined />
      </div>
    </Dropdown>
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>Amount</span>
      <span>Wallet: {parseFloat(balance).toFixed(3)} {direction == "Deposit" ? <>{token}</> : <>GEV</>}</span>
    </div>
    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Input
        placeholder="Amount"
        suffix=<a href="#" onClick={()=>{setInputValue(balance)}}>Max</a>
        bordered={false}
        onChange={(e) => setInputValue(e.target.value)}
        key="inputamount"
        value={inputValue}
        style={{ backgroundColor: "#1D2329", padding: 8, color: 'white' }}
      />
    </div>
    <div style={{ marginTop: 24, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{direction} Fee</span>
      <span>{parseFloat(operationFee).toFixed(2)}%</span>
    </div>
    {isSpinning ? (
      <Button type="default" style={{ width: "100%" }}>
        <Spin />
      </Button>
    ) : (
      <Button
        type="primary"
        onClick={()=>{direction == "Deposit" ? deposit() : withdraw()}}
        disabled={isButtonDisabled}
         style={{ width: "100%" }}
      >
        {direction+" "+token}
      </Button>
    )}
    <Divider />
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>My Liquidity</span>
      <span>{parseFloat(geVault.wallet).toFixed(2)} GEV (${parseFloat(geVault.walletValue).toFixed(0)})</span>
    </div>
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>My Share</span>
      <span>{(100*parseFloat(geVault.walletValue)/parseFloat(geVault.tvl)).toFixed(2)}%</span>
    </div>
  </Card>);
};

export default GeVaultForm;
