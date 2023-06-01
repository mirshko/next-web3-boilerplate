import { useEffect, useState } from "react";
import useAddresses from "./useAddresses";
import useOptionsPositionManager from "./useOptionsPositionManager";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import axios from "axios";

const usePerpsEventLogsV2 = (tickerAddress, vaultAddress, debt) => {
  const { account, library } = useWeb3React();

  const ADDRESSES = useAddresses(vaultAddress);
  const opm = useOptionsPositionManager();

  const topicBuy =
    "0xdc0cc97a08108cdb9e44a974a24bbf23b7d5871ba94674c1f06f3b020565bb23"; // BuyOptions(...)
  const topicClose =
    "0x13a9b207a6235519f908e828190fa2f938b5e52c7888b90b98b87125caebde6e"; // ClosePosition(...)
  const topicLiquidation =
    "0x11473f8e98477c5f8d293225476df74ef051ed687455ef4c509117ebd0040437"; // LiquidatePosition(...)
  const apiKey = "BYUIRGM2YBGEM36ZSC7PWW7DTAP8FY2KIW";

  const url = library
    ? "https://api.arbiscan.io/api?module=logs&action=getLogs&fromBlock=67050855&toBlock=" +
      library._fastBlockNumber +
      "&address=" +
      ADDRESSES["optionsPositionManager"] +
      "&topic0_1_opr=and" +
      "&topic1=0x000000000000000000000000" +
      account.substring(2, 42) +
      (tickerAddress
        ? "&topic1_2_opr=and&topic2=0x000000000000000000000000" + tickerAddress.substring(2, 42)
        : "") +
      "&apikey=" +
      apiKey
    : undefined;

  const [data, setdata] = useState(null);
  // only update debt when a serious change happens, like new position opened, but dont poll every minimal interest accrual
  const rDebt = Math.round(debt / 2);
  const delay = ms => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    const getEvents = async () => {
      try {
        var eventsBuy = await axios.get(url + "&topic0=" + topicBuy);
        await delay(1200)
        var eventsSell = await axios.get(url + "&topic0=" + topicClose);
        // to know the total opened, we need to loop over all the BuyOptions tx since last ClosePosition (no partial close) -> concat and order
        var events = eventsBuy.data.result
          .concat(eventsSell.data.result)
          .sort((a, b) => {
            return Number(a.blockNumber) > Number(b.blockNumber) ? -1 : 1;
          });

        console.log("events", events);

        let hasSwapped = false;
        let token0Amount = 0;
        let token1Amount = 0;
        let assetValue = 0;
        let data = {};

        for (let e of events) {
          // currently no partial close: if ClosePosition event, exit
          if (e.topics[0] == topicClose) break;

          data = e;
          // check tx logs: in each tx, check whether there was a swap, and how many of each tokens was deposited inthe LP
          let receipt = await library.getTransactionReceipt(e.transactionHash);
          console.log(receipt)
          for (let log of receipt.logs) {
            if (
              log.topics[0] ==
              "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
            ) {
              hasSwapped = true; // swap topic
            }
            if (
              log.topics[0] ==
              "0xde6857219544bb5b7746f48ed30be6386fefc61b2f864cacf559893bf50fd951"
            ) {
              // deposit in LP
              let amount = Number("0x" + log.data.substring(66, 130));
              if (
                "0x" + log.topics[1].substring(26, 66) ==
                ADDRESSES.lendingPools[0].token0.address.toLowerCase()
              )
                token0Amount += amount;
              if (
                "0x" + log.topics[1].substring(26, 66) ==
                ADDRESSES.lendingPools[0].token1.address.toLowerCase()
              )
                token1Amount += amount;
            }
          }
        }

        data.hasSwapped = hasSwapped;
        data.token0Amount = token0Amount;
        data.token1Amount = token1Amount;
        //
        setdata(data);
      } catch (e) {
        console.log("Get events", e);
      }
    };

    if (tickerAddress && account && debt > 0) getEvents();
  }, [tickerAddress, account, rDebt]);

  return data;
};

export default usePerpsEventLogsV2;
