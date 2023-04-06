import { useState } from "react";
import { Card, Button, Input, Spin, Divider } from "antd";
import { useWeb3React } from "@web3-react/core";
import useGeVault from "../hooks/useGeVault";
import useAssetData from "../hooks/useAssetData";
import useTokenContract from "../hooks/useTokenContract";
import { useTxNotification } from "../hooks/useTxNotification";
import useETHBalance from "../hooks/useETHBalance";
import { ethers } from "ethers";


/// Asserts that ETH is always token0 (as per arbitrum)
const GeVaultForm = ({vault}) => {
  if (vault.token0.name == "WETH") vault.token0.name = "ETH";
  const { account } = useWeb3React();
  const [direction, setDirection] = useState("Deposit");
  const [token, setToken] = useState(vault.token0.name)
  const [inputValue, setInputValue] = useState()
  const [isSpinning, setSpinning] = useState(false);
  const [showSuccessNotification, showErrorNotification, contextHolder] =
    useTxNotification();
  const geVault = useGeVault(vault);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  
  const ethBalance = useETHBalance(account).data / 1e18;
  const assetData = useAssetData(vault.token0.name == token ? vault.token0.address : vault.token1.address, vault.address);
  const tokenContract = useTokenContract(assetData.address);
  const isButtonDisabled = !inputValue
    || (token == "ETH" && parseFloat(inputValue) > ethBalance )
    || (token != "ETH" && parseFloat(inputValue) > assetData.wallet )
    ;

  // if deposit token0 or withdraw token1, fee is fee0
  var operationFee = geVault.fee1;
  if ( (direction == "Deposit" && token == vault.token0.name) || (direction == "Withdraw" && token == vault.token1.name) ) operationFee = geVault.fee0;
  var balance = geVault.wallet;
  if (direction == "Deposit") {
    if( token == "ETH" ) balance = ethBalance
    else balance = assetData.wallet
  }
  
  const deposit = async () => {
    setSpinning(true);
    try {
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
      showErrorNotification(e.code, e.message);
    }
    setSpinning(false);
  }
  
  
  const withdraw = async () => {
    setSpinning(true);
    try {
      let result = await geVault.contract.withdraw(assetData.address, ethers.utils.parseUnits(inputValue, 18));
      showSuccessNotification(
        "Assets withdrawn",
        "Assets withdrawn successful",
        result.hash
      );
    }
    catch(e){
      console.log("Error withdrawing", e.message);
      showErrorNotification(e.code, e.message);
    }
    setSpinning(false);
  }
  
  
  return(<Card>
    {contextHolder}
    <div>
      <Button
        type={direction == "Deposit" ? "primary" : "default"}
        style={{ width: "50%", textAlign: "center" }}
        onClick={() => {
          setDirection("Deposit");
        }}
      >
        <strong>Deposit</strong>
      </Button>
      <Button
        type={direction == "Withdraw" ? "primary" : "default"}
        style={{ width: "50%", textAlign: "center" }}
        onClick={() => {
          setDirection("Withdraw");
        }}
      >
        <strong>Withdraw</strong>
      </Button>      
    </div>
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{}}>{direction}</span>
      <Button
        type={token == vault.token0.name ? "primary" : "default"}
        style={{ width: "30%", textAlign: "center" }}
        onClick={() => {
          setToken(vault.token0.name);
        }}
      >
        <strong>{vault.token0.name}</strong>
      </Button>
      <Button
        type={token == vault.token1.name ? "primary" : "default"}
        style={{ width: "30%", textAlign: "center" }}
        onClick={() => {
          setToken(vault.token1.name);
        }}
      >
        <strong>{vault.token1.name}</strong>
      </Button>
    </div>
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>Wallet</span>
      <span>{parseFloat(balance).toFixed(3)} {direction == "Deposit" ? <>{token}</> : <>GEV</>}</span>
    </div>
    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Input
        placeholder="Amount"
        suffix={token}
        onChange={(e) => setInputValue(e.target.value)}
        key="inputamount"
        value={inputValue}
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
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>TVL</span>
      <span>${parseFloat(geVault.tvl).toFixed(0)}</span>
    </div>
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>Max TVL Cap</span>
      <span>${parseFloat(geVault.maxTvl).toFixed(0)}</span>
    </div>
  </Card>);
};

export default GeVaultForm;
