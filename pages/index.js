import { verifyMessage } from "@ethersproject/wallet";
import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import useBlockNumber from "../hooks/useBlockNumber";
import useEagerConnect from "../hooks/useEagerConnect";
import useETHBalance from "../hooks/useETHBalance";
import usePersonalSign from "../hooks/usePersonalSign";

export default function Home() {
  const { account, library, chainId } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const sign = usePersonalSign();

  const { data: ethBalance } = useETHBalance(account);
  const { data: blockNumber } = useBlockNumber();

  return (
    <div>
      <Head>
        <title>Next Web3 Boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Link href="/">
            <a>Next Web3 Boilerplate</a>
          </Link>

          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
      </header>

      <main>
        <h1>
          Welcome to <a href="https://nextjs.org">Next</a> Web3 Boilerplate
        </h1>

        {typeof account === "string" && !!library && (
          <section>
            <p>ETH Balance: {ethBalance}</p>
            <p>Block Number: {blockNumber}</p>
            <p>Chain Id: {chainId}</p>

            <button
              onClick={async () => {
                const message = "Next Web3 Boilerplate Rules!";

                const signature = await sign(message);

                console.log(
                  "isValid",
                  verifyMessage(message, signature) === account
                );
              }}
            >
              Personal Sign
            </button>
          </section>
        )}
      </main>

      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
