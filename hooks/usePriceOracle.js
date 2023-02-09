import useContract from './useContract';
import useAddresses from '../hooks/useAddresses';
import IPriceOracle_ABI from '../contracts/IPriceOracle.json';

export default function usePriceOracle() {
  const chainAddresses = useAddresses();
  
  const oracleContract = useContract(chainAddresses['priceOracle'], IPriceOracle_ABI)
  return oracleContract;
}