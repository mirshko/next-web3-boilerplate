## ⚠️ Notice
This template is no longer under active maintenance, it's out-of-date with the state of the ethereum ecosystem. Some reccomendations for replacing this would be to use the [Next.js + TypeScript + ConnectKit](https://github.com/family/connectkit/tree/main/examples/nextjs) example from Family, using [wagmi](https://wagmi.sh) directly or [web3modal](https://github.com/WalletConnect/web3modal).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmirshko%2Fnext-web3-boilerplate)

This is a default [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), customized as the default boilerplate for new Web3 projects.

## Features

- Separate packages from [ethers.js](https://docs.ethers.io/v5/) for improved tree-shaking, often only ethers Contracts
- Hooks-first approach to fetching and caching data from Contracts and memoization for performance with [SWR](https://swr.vercel.app)
- [web3-react](https://github.com/NoahZinsmeister/web3-react) for ease of connecting to Web3 providers with a solid API
- Auto-generates types for the contract ABIs in the `/contracts` folder via [TypeChain](https://github.com/ethereum-ts/TypeChain)

### Auto Contract Type Generation

**Note**: After adding in your new contract ABIs (in JSON format) to the `/contracts` folder, run `yarn compile-contract-types` to generate the types.

You can import these types when declaring a new Contract hook. The types generated show the function params and return types of your functions, among other helpful types. 

```ts
import MY_CONTRACT_ABI from "../contracts/MY_CONTRACT.json";
import type { MY_CONTRACT } from "../contracts/types";
import useContract from "./useContract";

export default function useMyContract() {
  return useContract<MY_CONTRACT>(CONTRACT_ADDRESS, MY_CONTRACT_ABI);
}
```

## Previous Art

- [NoahZinsmeister/hypertext](https://github.com/NoahZinsmeister/hypertext)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
