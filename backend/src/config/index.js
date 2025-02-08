
const dotenv = require('dotenv');
const { Web3 } = require('web3');
const { ethers } = require('ethers');

dotenv.config();

const rpcUrl = (process.env.TEST_MODE === 'true')
    ? 'https://testapi.omaxray.com'
    : 'https://mainapi.omaxscan.com';

const web3 = new Web3(rpcUrl);
const provider = new ethers.JsonRpcProvider(rpcUrl);

exports.config = {
    testMode: process.env.TEST_MODE === 'true',
    port: {
        https: 2101,
        wss: 2102,
    },
    rpcUrl: rpcUrl,

    scanUrl: (process.env.TEST_MODE === 'true')
        ? 'https://testnet.omaxscan.com'
        : 'https://omaxscan.com',

    pumpfunAddress: (process.env.TEST_MODE === 'true')
        ? '0xaF218243096aeb4e37d119ea28F83e1473EcC011'
        : '0x1f53E9893Fa64a9a44EA4EF4b26CFfD1212D40E1',

    factoryAddress: "0x441b9333D1D1ccAd27f2755e69d24E60c9d8F9CF",
    womaxAddress: "0x373e4b4E4D328927bc398A9B50e0082C6f91B7bb",

    web3: web3,
    provider: provider,
    chainId: (process.env.TEST_MODE === 'true') ? 332 : 311,
    tokenDecimals: 18,
    tokenTotalSupply: 10_000_000_000,   // 10 B
    initVirtBase: 10_000_000_000,       // 10 B
    initVirtQuote: 1_000_000,             // 500_000 OMAX
    kothQuoteReserve: 2_000_000,        // +1_000_000 OMAX
    completeQuoteReserve: 4_000_000,    // +2_000_000 OMAX
    createFee: 1_000,                   // 1_000 OMAX
    quotesForSelf: 100_000,             // 100_000 OMAX
    priceDenom: 1_000_000_000_000,
    dataType: {
        lastToken: 0xFF01,
        lastTrade: 0xFF02,
    }
};
