import RM_ABI from "../contracts/RangeManager.json";
import useContract from "./useContract";
import useAddresses from '../hooks/useAddresses';

export default function useRangeManager(lpAddress) {
  const vault = useAddresses(lpAddress);
  
  return useContract(vault.lendingPools.length > 0 ? vault.lendingPools[0]['rangeManager'] : null, RM_ABI);
}
