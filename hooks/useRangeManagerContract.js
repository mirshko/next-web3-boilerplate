import ZAPBOX_ABI from "../contracts/Zapbox.json";
import useContract from "./useContract";

export default function useZapboxContract(zapboxAddress) {
  return useContract(zapboxAddress, ZAPBOX_ABI);
}
