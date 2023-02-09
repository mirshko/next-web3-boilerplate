import RM_ABI from "../contracts/RangeManager.json";
import useContract from "./useContract";

export default function useRangeManagerContract(rmAddress) {
  return useContract(rmAddress, RM_ABI);
}
