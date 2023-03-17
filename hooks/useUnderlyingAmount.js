import { useEffect, useState } from "react";
import useContract from "./useContract";
import usePriceOracle from "./usePriceOracle";
import TR_ABI from "../contracts/TokenizableRange.json";
import UniswapV2Pair_ABI from "../contracts/UniswapV2Pair.json";
import { ethers } from "ethers";

export default function useUnderlyingAmount(
  rangeAddress,
  vault,
  isIncludingFees
) {
  const [tokenAmounts, setTokenAmounts] = useState({ amount0: 0, amount1: 0 });
  const [tokenAmountsExcludingFees, setTokenAmountsExcludingFees] = useState({
    amount0: 0,
    amount1: 0,
  });
  const [totalSupply, setTotalSupply] = useState(0);

  var type = "v3";
  if (vault["lpToken"] && vault["lpToken"].address == rangeAddress) type = "v2";

  const ranger = useContract(
    rangeAddress,
    type == "v2" ? UniswapV2Pair_ABI : TR_ABI
  );
  const oracle = usePriceOracle();

  // Get the underlying token amounts for the Ranger
  useEffect(() => {
    const getTokenAmounts = async () => {
      if (!ranger) return;

      let tSupply = await ranger.totalSupply();
      setTotalSupply(tSupply);

      var data, dataExcludingFees;
      // var oracleValue = await oracle.getAssetPrice(rangeAddress)
      if (type == "v2") {
        let res = await ranger.getReserves();
        data = { token0Amount: res[0], token1Amount: res[1] };
      } else if (type == "v3") {
        // changed from getTokenAmounts to getTokenAmountsExcludingFees to ignore potential non compounded fees
        data = await ranger.getTokenAmounts(tSupply);
        dataExcludingFees = await ranger.getTokenAmountsExcludingFees(tSupply);
      }

      setTokenAmounts({
        amount0: data
          ? ethers.utils.formatUnits(data.token0Amount, vault.token0.decimals)
          : 0,
        amount1: data
          ? ethers.utils.formatUnits(data.token1Amount, vault.token1.decimals)
          : 0,
      });
      setTokenAmountsExcludingFees({
        amount0: dataExcludingFees
          ? ethers.utils.formatUnits(
              dataExcludingFees.token0Amount,
              vault.token0.decimals
            )
          : 0,
        amount1: dataExcludingFees
          ? ethers.utils.formatUnits(
              dataExcludingFees.token1Amount,
              vault.token1.decimals
            )
          : 0,
      });
    };
    try {
      getTokenAmounts();
    } catch (e) {
      console.log("getTokenAmounts", e);
    }
  }, [ranger]);

  return { tokenAmounts, tokenAmountsExcludingFees, totalSupply };
}
