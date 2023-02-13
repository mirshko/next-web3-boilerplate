import LPM_ABI from "../contracts/LonggPositionManager.json";
import useContract from "./useContract";
import useAddresses from '../hooks/useAddresses';

export default function useLonggPositionManager() {
  const chainAddresses = useAddresses();
  
  return useContract(chainAddresses['longgPositionManager'], LPM_ABI);
}
