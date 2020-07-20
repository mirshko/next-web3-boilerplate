import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { parseBalance } from "../util";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getETHBalance(library) {
  return async (address, _) => {
    return library.getBalance(address).then((balance) => parseBalance(balance));
  };
}

export default function useETHBalance(address, suspense = false) {
  const { library, chainId } = useWeb3React();

  const shouldFetch = typeof address === "string" && !!library;

  const result = useSWR(
    shouldFetch ? [address, chainId, "ETHBalance"] : null,
    getETHBalance(library),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
