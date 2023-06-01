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
    <td>{new Date(tx.date ?? 0).toLocaleString()}</td>
    <td>{base}-{tx.strike}</td>
    <td>{action}</td>
    <td>{tx.underlying ? <>{sign}{parseFloat(tx.underlying.amount0 / 1e18).toFixed(5)}</> : " "} {base}</td>
    <td>{tx.underlying ? <>{sign}{parseFloat(tx.underlying.amount1 / 1e6).toFixed(3)}</> : " "} USDC</td>
    <td>{tx.amountDebt ? <>${sign}{parseFloat(tx.amountDebt / 1e18 * asset.oraclePrice).toFixed(3)}</> : " "}</td>
    <td>${tx.pnl ? parseFloat(tx.pnl/1e8).toFixed(6) : "-"}</td>
  </tr>)
}

export default HistoryTx;