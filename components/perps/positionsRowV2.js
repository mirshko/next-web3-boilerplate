import useAssetData from "../../hooks/useAssetData";
import useUnderlyingAmount from "../../hooks/useUnderlyingAmount";
import CloseTrPositionButton from "../closeTrPositionButton";
import useAddresses from "../../hooks/useAddresses";
import usePerpsEventLogs from "../../hooks/usePerpsEventLogs";
import useUniswapPrice from "../../hooks/useUniswapPrice";
import PnlPopup from  "./pnlPopup.js";
import { CaretUpOutlined, CaretDownOutlined, ExportOutlined } from "@ant-design/icons";

const PositionsRowV2 = ({ position, checkPositions, debtAddress }) => {
  const asset = useAssetData(debtAddress, position.vault);

  const vault = useAddresses(position.vault)['lendingPools'][0];
  const token0 = useAssetData(vault.token0.address, position.vault);
  const price = useUniswapPrice(
    vault.uniswapPool,
    vault.token0.decimals - vault.token1.decimals
  );

  // direction: position is de facto long whatever asset it mainly holds
  position.direction = (position.amount0 / 1e18 * price > position.amount1 / 1e6) ? "Long" : "Short"
  const { tokenAmounts, tokenAmountsExcludingFees, totalSupply } = useUnderlyingAmount(debtAddress, vault);
  
  // pnl = assets value - debt value , debt value = debt amount / total Supply * underlying value
  let pnl = (position.amount0 / 1e18 * price + position.amount1 / 1e6) 
            - asset.debt * 1e18 / totalSupply * (tokenAmounts.amount0 * price + parseFloat(tokenAmounts.amount1))
  
  let pnlPercent = pnl / (position.entryUsd / 1e8) * 100;
  let direction = position.direction;
  let entry = position.avgEntry;

  const tdStyle = { paddingTop: 4, paddingBottom: 4 };

  return (
    <tr key={asset.address}>
      <td style={{...tdStyle, paddingLeft: 0, fontWeight: 'bold'}}>
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
        <span style={{fontWeight: 500 }}>${(position.entryUsd / 1e8).toFixed(2)}</span>
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

export default PositionsRowV2;
