import { Card, Typography } from 'antd';
import useLeaderboard from '../hooks/useLeaderboard';


// Display all user assets and positions in all ROE LPs
const Leaderboard = ({}) => {
  const lb = useLeaderboard();
  while ( lb[Object.keys(lb)[0]] > 10000 ) delete lb[Object.keys(lb)[0]];
  
  return (<div style={{ minWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <img src="/images/1500x500.jpg" alt="GoodEntry Banner" width="800" style={{borderRadius: 5}}/>
    <Card style={{ width: 800, marginTop: 24}}>
      <table>
        <thead>
          <tr>
            <th align="left">Rank</th>
            <th align="left">User</th>
            <th align="right">PnL ($)</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(lb).map( (k,i) => {
              if (lb[k] > 10000 || i >= 20) return <></>

              return (<tr>
                <td>{i+1}</td>
                <td>{k.substring(0, 6)}...{k.substring(34,42)}</td>
                <td align="right">{lb[k]}</td>
              </tr>)
            })
          }
        </tbody>
      </table>
    </Card>
  </div>);
  
}

export default Leaderboard;