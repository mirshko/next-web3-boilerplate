import { Card, Typography } from 'antd';
import usePositionsHistoryFull from "../hooks/usePositionsHistoryFull";


// Display all user assets and positions in all ROE LPs
const Tx = ({}) => {
  const txs = usePositionsHistoryFull();
  console.log('ts', txs)
  
  return (<div style={{ minWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <img src="/images/1500x500.jpg" alt="GoodEntry Banner" width="800" style={{borderRadius: 5}}/>
    <Card style={{ width: 800, marginTop: 24}}>
      <table>
        <thead>
          <tr>
            <th align="left">Date</th>
            <th align="left">Tx</th>
            <th align="left">User</th>
            <th align="right">Token</th>
            <th align="right">Type</th>
            <th align="right">~Size</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(txs).map( (k,i) => {
              var tx = txs[k];
              var tokname = tx.token0 == "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" ? "ETH"
                : tx.token0=="0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a" ? "GMX"
                : tx.token0=="0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" ? "BTC"
                : tx.token0=="0x912CE59144191C1204E64559FE8253a0e49E6548" ? "ARB"
                : "???"
              
              
              console.log(tx)
              if (tx.type != "BuyOptions") return <></>

              return (<tr key={i}>
                <td>{new Date(tx.date).toString().substring(0,24)}</td>
                <td><a href={"https://arbiscan.io/tx/"+tx.hash} target="_black" rel="noreferrer">{tx.hash.substring(0, 6)}...</a></td>
                <td>{tx.user.substring(0, 6)}...{tx.user.substring(38,42)}</td>
                <td align="right">{tokname}-{tx.strike}</td>
                <td align="right">{tx.hasSwapped ? "ITM" : "OTM"} {tx.underlying.amount0 > 0 ? "Long" : "Short"}</td>
                <td align="right">{(parseInt(tx.amountDebt)/10**18).toFixed(0)}</td>
              </tr>)
            })
          }
        </tbody>
      </table>
    </Card>
  </div>);
  
}

export default Tx;