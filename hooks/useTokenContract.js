import ERC20_ABI from "../contracts/ERC20.json";
import useContract from "./useContract";

export default function useTokenContract(tokenAddress) {
  return useContract(tokenAddress, ERC20_ABI);
}
