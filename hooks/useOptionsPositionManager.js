import OPM_ABI from "../contracts/OptionsPositionManager.json";
import useContract from "./useContract";
import useAddresses from '../hooks/useAddresses';

export default function useOptionsPositionManager() {
  const chainAddresses = useAddresses();
  
  return useContract(chainAddresses['optionsPositionManager'], OPM_ABI);
}
