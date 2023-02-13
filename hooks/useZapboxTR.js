import ZBTR_ABI from "../contracts/ZapboxTR.json";
import useContract from "./useContract";
import useAddresses from "./useAddresses";

export default function useZapboxTR() {
  const ADDRESSES = useAddresses()
  
  return useContract(ADDRESSES['zapboxTR'], ZBTR_ABI);
}
