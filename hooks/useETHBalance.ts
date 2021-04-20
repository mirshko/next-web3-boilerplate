import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { parseBalance } from "../util";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getETHBalance(library: Web3Provider) {
  return async (_: string, address: string) => {
    return library.getBalance(address).then((balance) => parseBalance(balance));
  };
}

export default function useETHBalance(address: string, suspense = false) {
  const { library, chainId } = useWeb3React();

  const shouldFetch = typeof address === "string" && !!library;

  const result = useSWR(
    shouldFetch ? ["ETHBalance", address, chainId] : null,
    getETHBalance(library),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
