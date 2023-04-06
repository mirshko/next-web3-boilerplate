import useSWR from "swr";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useTokenContract from "./useTokenContract";

export default function useTokenBalance(
  address,
  tokenAddress,
  suspense
) {
  const contract = useTokenContract(tokenAddress);
  if (tokenAddress == "0x566A1F87164Db0524aAD0a0D5968b8755E80B8F3")console.log(address, '--', tokenAddress)

  const shouldFetch =
    typeof address === "string" &&
    typeof tokenAddress === "string" &&
    !!contract;
    
  const result = useSWR(
    shouldFetch ? ["TokenBalance", address, tokenAddress] : null,
    ([, address]) => contract.balanceOf(address),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);
  return result;
}
