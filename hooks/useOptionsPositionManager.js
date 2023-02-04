import OPM_ABI from "../contracts/OptionsPositionManager.json";
import useContract from "./useContract";
import useAddresses from "./useAddresses";

export default function useOptionsPositionManager() {
  const ADDRESSES = useAddresses()
  return useContract(ADDRESSES["optionsPositionManager"], OPM_ABI);
}
