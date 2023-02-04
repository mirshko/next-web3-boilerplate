import RPM_ABI from "../contracts/RangerPositionManager.json";
import useContract from "./useContract";
import useAddresses from "./useAddresses";

export default function useRangerPositionManager() {
  const ADDRESSES = useAddresses()
  const rpm = useContract(ADDRESSES["rangerPositionManager"], RPM_ABI);
  return rpm;
}
