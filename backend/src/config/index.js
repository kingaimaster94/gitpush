
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
    rpcUrl: (process.env.TEST_MODE === 'true')
        ? 'https://testapi.omaxray.com'
        : 'https://mainapi.omaxscan.com',

    scanUrl: (process.env.TEST_MODE === 'true')
        ? 'https://testnet.omaxscan.com'
        : 'https://omaxscan.com',

    pumpfunAddress: (process.env.TEST_MODE === 'true')
        ? '0xaF218243096aeb4e37d119ea28F83e1473EcC011'
        : 'https://omaxscan.com',

    web3: web3,
    provider: provider,
    tokenDecimals: 18,
    tokenTotalSupply: 10_000_000_000,   // 10 B
    initVirtBase: 10_000_000_000,       // 10 B
    initVirtQuote: 500_000,             // 500_000 OMAX
    kothQuoteReserve: 1_000_000,        // +1_000_000 OMAX
    completeQuoteReserve: 2_000_000,    // +2_000_000 OMAX
    createFee: 1_000,                   // 1_000 OMAX
    quotesForSelf: 100_000,             // 100_000 OMAX
    priceDenom: 1_000_000_000_000,
    dataType: {
        lastToken: 0xFF01,
        lastTrade: 0xFF02,
    }
};
