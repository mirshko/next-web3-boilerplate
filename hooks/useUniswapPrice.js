import { useState, useEffect } from "react";
import useContract from "./useContract";
import UniswapV3Pool_ABI from "../contracts/UniswapV3Pool.json";
import { ethers } from "ethers";

export default function useUniswapPrice(poolAddress, decimalsDiff) {
  const [price, setPrice] = useState(0);
  const poolContract = useContract(poolAddress, UniswapV3Pool_ABI);

  useEffect(() => {
    const getPrice = async () => {
      try {
        const slot0 = await poolContract.slot0();
        const p =
          slot0.sqrtPriceX96
            .pow(2)
            .mul(10 ** decimalsDiff)
            .shr(187)
            .toNumber() / 32; // shift 192 then div 32 = div 2**192, so we get some decimals
        setPrice(p);
      }
      catch(e) {console.log("Error fetching Uniswap price", e)}
    };

    const intervalId = setInterval(() => {
      if (poolAddress && poolContract) getPrice();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [poolAddress, poolContract]);

  return price;
}
