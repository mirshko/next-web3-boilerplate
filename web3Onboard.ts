import { init } from '@web3-onboard/react';
import injectedModule, { ProviderIdentityFlag, ProviderLabel } from '@web3-onboard/injected-wallets';

const Metamask = {
    label: 'Metamask',
    injectedNamespace: 'ethereum',
    checkProviderIdentity: ({ provider }) => !!provider && !!provider[ProviderIdentityFlag.MetaMask],
    getIcon: async () => (await import('./node_modules/@web3-onboard/injected-wallets/dist/icons/metamask')).default,
    getInterface: () => ({
        provider: window['ethereum']
    }),
    platforms: ['desktop', 'mobile']
};

const Rabby = {
    label: 'Rabby',
    injectedNamespace: 'ethereum',
    checkProviderIdentity: ({ provider }) => !!provider && !!provider[ProviderIdentityFlag.Rabby],
    getIcon: async () => (await import('./node_modules/@web3-onboard/injected-wallets/dist/icons/rabby')).default,
    getInterface: () => ({
        provider: window['ethereum']
    }),
    platforms: ['desktop']
};

const OkxWallet = {
    label: 'OKX Wallet',
    injectedNamespace: 'ethereum',
    checkProviderIdentity: ({ provider }) => !!provider && !!provider[ProviderIdentityFlag.OKXWallet],
    getIcon: async () => (await import('./node_modules/@web3-onboard/injected-wallets/dist/icons/okxwallet')).default,
    getInterface: () => ({
        provider: window['ethereum']
    }),
    platforms: ['desktop']
};

const injected = injectedModule({
    custom: [
        Metamask,
        OkxWallet,
        Rabby
    ],
    displayUnavailable: true,
    sort: (wallets) => {
        const okxwallet = wallets.find(({ label }) => label === ProviderLabel.OKXWallet)
        const metaMask = wallets.find(({ label }) => label === ProviderLabel.MetaMask)
        const rabby = wallets.find(({ label }) => label === ProviderLabel.Rabby)

        return [
            okxwallet,
            metaMask,
            rabby
        ]
    }
});

export default init({
    theme: 'dark',
    wallets: [
        injected,
    ],
    chains: [
        {
            id: 42161,
            token: 'ETH',
            label: 'Arbitrum One',
            rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/one/public'
        },
    ],
    connect: {
        iDontHaveAWalletLink: 'https://www.okx.com/web3',
        autoConnectAllPreviousWallet: true
    },
    accountCenter: {
        desktop: {
            enabled: false,
        },
        mobile: {
            enabled: false,
        }
    },
    appMetadata: {
        name: 'Good Entry',
        icon: '<svg></svg>',
        logo: '<svg></svg>',
        description: 'Good Entry',
        recommendedInjectedWallets: [
            {
                name: 'OKX Wallet',
                url: 'https://www.okx.com/web3'
            },
            {
                name: 'MetaMask',
                url: 'https://metamask.io'
            },
        ],
    }
});
