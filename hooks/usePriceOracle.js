import { useWeb3React } from "@web3-react/core";
import useContract from './useContract';
import IPriceOracle_ABI from '../contracts/IPriceOracle.json';

export default function usePriceOracle(oracleAddress) {
  const oracleContract = useContract(oracleAddress, IPriceOracle_ABI)
  return oracleContract;
}