import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import { isTestEnvironment, isSSR } from "../constants/environment";

export const useLogRocketInit = () => {
  const { account } = useWeb3React();

  useEffect(() => {
    if (!isSSR && !isTestEnvironment) {
      LogRocket.init("skrxde/goodentry");
      setupLogRocketReact(LogRocket);
    }
  }, []);

  useEffect(() => {
    if (!isSSR && !isTestEnvironment && account) {
      LogRocket.identify(account, {
        walletAddress: account,
      });
    }
  }, [account]);
};
