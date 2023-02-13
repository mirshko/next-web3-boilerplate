import ZB_ABI from "../contracts/Zapbox.json";
import useContract from "./useContract";
import useAddresses from "./useAddresses";

export default function useZapbox() {
  const ADDRESSES = useAddresses()
  return useContract(ADDRESSES['zapbox'], ZB_ABI);
}
