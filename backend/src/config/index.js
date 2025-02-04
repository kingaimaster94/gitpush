
const dotenv = require('dotenv');
dotenv.config();


exports.config = {
    testMode: process.env.TEST_MODE === 'true', 
    port: {
        https: 2101, 
        wss: 2102, 
    }, 
    rpcUrl: (process.env.TEST_MODE === 'true') 
        ? 'https://api.devnet.solana.com' 
        : 'https://mainnet.helius-rpc.com/?api-key=e0762009-5522-4263-a855-b8fc58a53dc9', 
    
    PROGRAM_ID: '5BXzjtQpmqdXeDNmThjDYHsjFGviDCeW58SpumTW86Fa', 
    tokenDecimals: 6, 
    tokenTotalSupply: 1_000_000_000, 
    initVirtBase: 200_000_000, 
    initVirtQuote: 28_000_000_000, // 28 SOL
    kothQuoteReserve: 42_000_000_000, // +42 SOL
    completeQuoteReserve: 85_000_000_000, // +85 SOL
    quotesForSelf: 6_000_000_000, // 6 SOL
    
    dataType: {
        lastToken: 0xFF01, 
        lastTrade: 0xFF02, 
    }
};
