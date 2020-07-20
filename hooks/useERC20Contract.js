import useContract from "./useContract";

const ABI = [
  "function balanceOf(address owner) view returns (uint)",
  "function transfer(address to, uint amount)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

/**
 * @name useERC20Contract
 * @description Uses the new Human-Readable ABI format from ethers v5. Supports ERC20 contract functions of 'balanceOf', 'transfer', and the 'Transfer' event itself.
 * @param {string} address
 */
export default function useERC20Contract(address) {
  return useContract(address, ABI);
}
