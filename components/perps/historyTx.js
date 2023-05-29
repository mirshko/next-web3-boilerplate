import ethers from "ethers";
import useAssetData from "../../hooks/useAssetData";

const HistoryTx = ({tx}) => {
  const asset = useAssetData(tx.asset)
  const base = tx.ticker ? tx.ticker 
      : tx.strike >= 500 ? "ETH"
        : tx.strike >= 20 ? "GMX"
          : "ARB"
  var action;
  var sign = "-";
  if (tx.type == "BuyOptions") {
    action = "Open";
    sign = "+"
  }
  else if (tx.type == "ClosePosition") action = "Close"
  else if (tx.type == "LiquidatePosition") action = "Liquidation"
  else return <></>
     
  return (<tr>
    <td>{base}-USDC</td>
    <td>{action}</td>
    <td>{tx.underlying ? <>{sign}{parseFloat(tx.underlying.amount0 / 1e18).toFixed(5)}</> : " "} {base}</td>
    <td>{tx.underlying ? <>{sign}{parseFloat(tx.underlying.amount1 / 1e6).toFixed(3)}</> : " "} USDC</td>
    <td>{tx.amountDebt ? <>${sign}{parseFloat(tx.amountDebt / 1e18 * asset.oraclePrice).toFixed(3)}</> : " "}</td>
    <td>-</td>
  </tr>)
}

export default HistoryTx;