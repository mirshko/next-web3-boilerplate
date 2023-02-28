import WETHG_ABI from "../contracts/WethGateway.json";
import useContract from "./useContract";
import useAddresses from "./useAddresses";

export default function useWethGateway() {
  const ADDRESSES = useAddresses()
  
  return useContract(ADDRESSES['wethGateway'], WETHG_ABI);
}
