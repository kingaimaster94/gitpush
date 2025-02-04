
const { Connection, 
    PublicKey, 
    Keypair, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    NATIVE_MINT, 
    getAssociatedTokenAddressSync
} = require('@solana/spl-token');
const anchor = require('@project-serum/anchor');
const bs58 = require("bs58");
const dotenv = require('dotenv');

const { config } = require('../config/');
const { Token, 
    TokenPrice 
} = require('../db/');
const { sleep } = require('../utils/basic');
const Keys = require('./keys');
const { IDL } = require('./idl');
const { connection, 
    mySendAndConfirmTransaction 
} = require('./utils');
const { createOpenBookMarket } = require('./market');
const { createPool, 
    getPoolInfo 
} = require('./pool');
const { getTokenBalance, 
    burnTokens 
} = require('./engine');


dotenv.config();


const adminWallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.ADMIN_PRIVKEY)));


const getProgram = (wallet) => {
    const provider = new anchor.AnchorProvider(
        connection, 
        wallet, 
        anchor.AnchorProvider.defaultOptions()
    );

    const program = new anchor.Program(IDL, config.PROGRAM_ID, provider);
    return program;
};

const contract_isPoolComplete = async (baseToken, quoteMint) => {
    const baseMint = new PublicKey(baseToken);
    const poolStateKey = await Keys.getPoolStateKey(baseMint, quoteMint);

    const program = getProgram(adminWallet);
    const poolStateInfo = await program.account.poolState.fetch(poolStateKey);
    if (!poolStateInfo) return false;

    return poolStateInfo?.complete;
};

const contract_withdraw = async (baseToken) => {
    // console.log('contract_withdraw - start');

    const admin = adminWallet.publicKey;
    const program = getProgram(adminWallet);
    const mainStateKey = await Keys.getMainStateKey();
    const mainStateInfo = await program.account.mainState.fetch(mainStateKey);
    if (!mainStateInfo)
        throw new Error("Failed to fetch mainState!");

    const owner = mainStateInfo.owner;

    const baseMint = new PublicKey(baseToken);
    if (!baseMint) {
        throw new Error("Invalid token");
    }
    const quoteMint = NATIVE_MINT;
    const poolStateKey = await Keys.getPoolStateKey(baseMint, quoteMint);
    
    const reserverBaseAta = getAssociatedTokenAddressSync(baseMint, poolStateKey, true);
    const reserverQuoteAta = getAssociatedTokenAddressSync(quoteMint, poolStateKey, true);
    const adminBaseAta = getAssociatedTokenAddressSync(baseMint, admin);
    const adminQuoteAta = getAssociatedTokenAddressSync(quoteMint, admin);

    const tx = new Transaction().add(
        await program.methods
            .withdraw()
            .accounts({
                admin, owner, 
                mainState: mainStateKey, 
                poolState: poolStateKey, 
                baseMint, quoteMint, 
                reserverBaseAta, reserverQuoteAta, 
                adminBaseAta, adminQuoteAta, 
                systemProgram: SystemProgram.programId, 
                tokenProgram: TOKEN_PROGRAM_ID, 
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
        // .preInstructions([web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })]);
        .instruction()
    );

    const txHash = await mySendAndConfirmTransaction(connection, adminWallet, tx, {
        maxRetries: 0
    });
    console.log('  withdraw txHash:', txHash);
    
    return txHash;
};


const onCreateEvent = async (event) => {
    let token = await Token.findOne({ tokenAddr: event.baseMint });
    if (token) {
        console.error(`Already registered token with mint ${event.baseMint}`);
        return;
    }
    
    token = new Token({
        tokenAddr: event.baseMint, 
        cdate: Date.now()
    });
    await token.save();

    const tokenPrice = new TokenPrice({
        tokenId: token._id, 
        baseReserve: event.baseReserves, 
        quoteReserve: event.quoteReserves, 
        price: (event.quoteReserves / LAMPORTS_PER_SOL) / (event.baseReserves / (10 ** config.tokenDecimals) - config.initVirtBase), 
        timestamp: Date.now()
    });
    await tokenPrice.save();
};

const onTradeEvent = async (event) => {
    const token = await Token.findOne({ tokenAddr: event.baseMint });
    if (!token) {
        console.error(`Failed to find token with the mint ${event.baseMint}`);
        return;
    }

    const tokenPrice = new TokenPrice({
        tokenId: token._id, 
        baseReserve: event.baseReserves, 
        quoteReserve: event.quoteReserves, 
        price: (event.quoteReserves / LAMPORTS_PER_SOL) / (event.baseReserves / (10 ** config.tokenDecimals) - config.initVirtBase), 
        timestamp: Date.now()
    });
    await tokenPrice.save();

    // crown token if eligible
    if (token.koth === false 
        && token.crownDate === null 
        && (Number(event.quoteReserves) - config.initVirtQuote) >= config.kothQuoteReserve) {
        console.log('------------- koth was selected -----------------');
        // remove last koth
        const lastKoth = await Token.findOne({ koth: true });
        if (lastKoth) {
            lastKoth.koth = false;
            lastKoth.crownDate = null;
            await lastKoth.save();
        }

        // set current koth
        token.koth = true;
        token.crownDate = Date.now();
        await token.save();
    }
};

const onCompleteEvent = async (event) => {
    const token = await Token.findOne({ tokenAddr: event.baseMint });
    if (!token) {
        console.error(`Failed to find token with the mint ${event.baseMint}`);
        return;
    }

    try {
        // withdraw
        const isComplete = await contract_isPoolComplete(event.baseMint, NATIVE_MINT);
        console.log('isComplete:', isComplete);
        if (!isComplete) {
            console.error("Bonding curve not completed yet!");
            return;
        }

        console.log('withdrawing...');
        await contract_withdraw(event.baseMint);
        console.log('withdrew');

        // create pool on raydium
        console.log('creating OpenBookMarket...');
        await createOpenBookMarket(connection, adminWallet, event.baseMint, NATIVE_MINT, 1, 0.000001);
        console.log('created OpenBookMarket');
        // await createPool(connection, 
        //     adminWallet, 
        //     event.baseMint, 
        //     1_250_000 * (10 ** config.tokenDecimals), 
        //     100_000_000); // create pool for test - 1.25M tokens and 0.1 SOL
        // create 12K liquidity with 79 SOL
        console.log('creating pool...');
        await createPool(connection, 
            adminWallet, 
            event.baseMint, 
            200_000_000 * (10 ** config.tokenDecimals),         // 20% of total supply
            config.completeQuoteReserve - config.quotesForSelf  // 79 SOL
        );
        console.log('created pool');
        
        // burn remaining tokens
        console.log('burning tokens...');
        await burnTokens(adminWallet, 
            event.baseMint, 
            Number(await getTokenBalance(adminWallet.publicKey, event.baseMint))
        );
        console.log('burnt tokens');
        // // burn LP tokens
        // console.log('burning LP...');
        // const poolKeys = getPoolInfo(event.baseMint, event.quoteMint);
        // await burnTokens(adminWallet, 
        //     poolKeys.lpMint, 
        //     Number(await getTokenBalance(adminWallet.publicKey, poolKeys.lpMint))
        // );
        // console.log('burnt LP');
    } catch (err) {
        console.error('onCompleteEvent error:', err.message);
    }
};

const captureEvents = async () => {
    console.log('capturing events...');

    const program = getProgram(adminWallet);
    
    const listenerCreateEvent = program.addEventListener('CreateEvent', async (event, slot) => {
        console.log('createEvent:', event);
        await onCreateEvent(event);
    });

    const listenerTradeEvent = program.addEventListener('TradeEvent', async (event, slot) => {
        console.log('tradeEvent:', event);
        await sleep(1_000); // sleep to prevent TradeEvent being processed ahead of CreateEvent
        await onTradeEvent(event);
        // await onCompleteEvent(event);
    });

    const listenerCompleteEvent = program.addEventListener('CompleteEvent', async (event, slot) => {
        console.log('completeEvent:', event);
        await sleep(2_000);
        await onCompleteEvent(event);
    });
};

captureEvents();
