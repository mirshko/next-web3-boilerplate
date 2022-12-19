import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";

export default function useBlockNumber() {
  const { library } = useWeb3React<Web3Provider>();
  const shouldFetch = !!library;

  return useSWR(
    shouldFetch ? ["BlockNumber"] : null,
    () => library.getBlockNumber(),
    {
      refreshInterval: 10 * 1000,
    }
  );
}
