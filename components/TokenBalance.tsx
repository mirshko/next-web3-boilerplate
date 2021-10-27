import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useTokenBalance from "../hooks/useTokenBalance";
import { parseBalance } from "../util";

type TokenBalanceProps = {
  tokenAddress: string;
  symbol: string;
};

const TokenBalance = ({ tokenAddress, symbol }: TokenBalanceProps) => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useTokenBalance(account, tokenAddress);

  return (
    <p>
      {`${symbol} Balance`}: {parseBalance(data ?? 0)}
    </p>
  );
};

export default TokenBalance;
