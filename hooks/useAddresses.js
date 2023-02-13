import { useWeb3React } from "@web3-react/core";
import addresses from "../contracts/RoeAddresses.json";

export default function useAddresses(pool) {
  const { chainId } = useWeb3React();
  //dev chain routes to polygon fork
  let chainAddresses;

  // deep copy object
  if (chainId == 1337 ) chainAddresses = JSON.parse(JSON.stringify(addresses["42161"]));
  else chainAddresses = (addresses[chainId] ? JSON.parse(JSON.stringify(addresses[chainId])) : JSON.parse(JSON.stringify(addresses[1])) );
  
  // if pool is specified, it acts as a filter for the lendingPools
  if (pool){
    let lp = []
    for (let k = 0; k < chainAddresses['lendingPools'].length; k++){
      if ( chainAddresses['lendingPools'][k].address == pool ) { 
        lp = [ chainAddresses['lendingPools'][k] ]; 
        break;
      }
    }
    chainAddresses['lendingPools'] = lp;
  }

  return chainAddresses;
}