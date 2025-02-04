
const dotenv = require('dotenv');
dotenv.config();


exports.config = {
    testMode: process.env.TEST_MODE === 'true', 
    port: {
        https: 2101, 
        wss: 2102, 
    }, 
    rpcUrl: (process.env.TEST_MODE === 'true') 
        ? 'https://testapi.omaxray.com' 
        : 'https://mainapi.omaxscan.com', 
    
    
    tokenDecimals: 18, 
    tokenTotalSupply: 10_000_000_000,   // 10 B
    initVirtBase: 10_000_000_000,       // 10 B
    initVirtQuote: 500_000,             // 500_000 OMAX
    kothQuoteReserve: 1_000_000,        // +1_000_000 OMAX
    completeQuoteReserve: 2_000_000,    // +2_000_000 OMAX
    createFee: 1_000,                   // 1_000 OMAX
    quotesForSelf: 100_000,             // 100_000 OMAX
    
    dataType: {
        lastToken: 0xFF01, 
        lastTrade: 0xFF02, 
    }
};
