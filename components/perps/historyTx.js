import ethers from "ethers";

const HistoryTx = ({tx}) => {
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
    <td>{sign}{tx.underlying ? parseFloat(tx.underlying.amount0 / 1e18).toFixed(5) : 0} {base}</td>
    <td>{sign}{tx.underlying ? parseFloat(tx.underlying.amount1 / 1e6).toFixed(3) : 0} USDC</td>
    <td>0</td>
    <td>0</td>
  </tr>)
}

export default HistoryTx;