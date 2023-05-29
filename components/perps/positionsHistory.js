import usePositionsHistory from "../../hooks/usePositionsHistory";
import HistoryTx from "./historyTx";

const PositionsHistory = ({ account }) => {
  const thStyle = {
    color: "#94A3B8",
    fontWeight: 500,
    textDecorationStyle: "dotted",
    textDecorationStyle: 'dotted', 
    textDecorationColor: 'grey',
    textDecorationLine: 'underline'
  }
  
  const history = usePositionsHistory(account);
  
  return (<>
    <table border={0}>
    <thead>
      <tr>
        <th align="left" style={{...thStyle, paddingLeft: 0}}>Instrument</th>
        <th align="left" style={thStyle}>Action</th>
        <th align="left" style={thStyle}>Change Base</th>
        <th align="left" style={thStyle}>Change Quote</th>
        <th align="left" style={thStyle}>Change Debt</th>
        <th align="left" style={thStyle}>PNL&nbsp;&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      {
        history && history.tx ? history.tx.map( tx => {
          return (<HistoryTx key={tx.hash} tx={tx} />);
        }) : <></>
      }
    </tbody>
    </table>
  </>)
}

export default PositionsHistory;