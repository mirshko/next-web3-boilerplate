import useAssetData from "../../hooks/useAssetData";
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import CloseTrPositionButton from "../closeTrPositionButton";
import useAddresses from "../../hooks/useAddresses";
import usePerpsEventLogs from "../../hooks/usePerpsEventLogs";
import useUniswapPrice from "../../hooks/useUniswapPrice";
import PnlPopup from  "./pnlPopup.js";
import { CaretUpOutlined, CaretDownOutlined, ExportOutlined } from "@ant-design/icons";

const PositionsRow = ({ position, checkPositions }) => {
  const asset = useAssetData(position.ticker, position.vault);
  const vault = useAddresses(position.vault)['lendingPools'][0];
  const token0 = useAssetData(vault.token0.address, position.vault);
  const price = useUniswapPrice(
    vault.uniswapPool,
    vault.token0.decimals - vault.token1.decimals
  );

  let upnl = 0
  // if opened ITM position, pnl is based on diff between entry and current price
  // else, based on diff between strike and current price
  if (position.direction == "Long") {
    if ( position.strike < position.entry ){ // ITM long
      if (price < position.strike ) upnl = position.strike - position.entry
      else upnl = price - position.entry
    }
    else { // OTM long
      if (price > position.strike) upnl = price - position.strike
    }
  }
  else { // Short
    if ( position.strike > position.entry ){ // ITM short
      if (price > position.strike ) upnl = position.entry - position.strike;
      else upnl = position.entry - price;
    }
    else { // OTM short
      if (price < position.strike) upnl = position.strike - price;
    }
  }

  upnl = upnl * (position.amountBase || 0)
  
  let fees = (asset.debt - position.amount / 10**18) * asset.oraclePrice // fees are the debt accumulated
  let pnl = upnl - fees;
  let pnlPercent = pnl / (asset.debt * asset.oraclePrice) * 100;
  let direction = position.direction;
  let entry = position.entry;

  const tdStyle = { paddingTop: 4, paddingBottom: 4 };

  return (
    <tr key={asset.address}>
      <td style={{...tdStyle, paddingLeft: 0}}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={token0.icon}
            alt={token0.name}
            height={20}
            style={{ marginRight: 8 }}
          />
          {token0.name} {asset.price}
        </div>
      </td>
      <td style={tdStyle}>
        <span
          style={{
            color: direction == "Long" ? "#55d17c" : "#e57673",
            fontWeight: "bold",
            fontSize: "smaller",
          }}
        >
          {direction.toUpperCase()}
        </span>
      </td>
      <td style={tdStyle}>
        <span style={{fontWeight: 500 }}>
          { position.amountQuote ? 
            <>{position.amountQuote.toFixed(2)} {vault.token1.name}</>
            : <>{position.amountBase.toFixed(5)} {vault.token0.name}</>
          }
        </span>
        <br />
        <span style={{ color: 'grey' }}>${(token0.oraclePrice * position.amountBase).toFixed(2)}</span>
      </td>
      <td style={tdStyle}>
        {(asset.debtApr / 365 / 24).toFixed(4)}%
      </td>
      <td style={tdStyle}>${entry.toFixed(2)}</td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center'}}>
          <div style={{ marginRight: 8}}>
            <span style={{ color: pnl > 0 ? "#55d17c" : "#e57673" }}>
              {pnl > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {pnlPercent.toFixed(2)}%
            </span>
            <br />
            {" "}${(isNaN(pnl) ? 0 : pnl).toFixed(3)}
          </div>
          
          <PnlPopup token0={token0} direction={direction} pnl={pnl} pnlPercent={pnlPercent} entry={entry} price={price} >
            <ExportOutlined />
          </PnlPopup>
        </div>
      </td>
      <td style={tdStyle}>
        <CloseTrPositionButton address={asset.address} vault={vault} checkPositions={checkPositions} />
      </td>
    </tr>
  );
};

export default PositionsRow;
