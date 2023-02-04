import AAVE_LP_ABI from "../contracts/AaveLendingPool.json";
import useContract from "./useContract";

export default function useLendingPoolContract(lpAddress) {
  let lp = useContract(lpAddress, AAVE_LP_ABI);
  return lp;
}
