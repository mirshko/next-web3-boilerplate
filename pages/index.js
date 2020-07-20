import Head from "next/head";
import Account from "../components/Account";
import useEagerConnect from "../hooks/useEagerConnect";

export default function Home() {
  const triedToEagerConnect = useEagerConnect();

  return (
    <div>
      <Head>
        <title>Next Web3 Boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
      </header>

      <main>
        <h1>
          Welcome to <a href="https://nextjs.org">Next</a> Web3 Boilerplate
        </h1>
      </main>
    </div>
  );
}
