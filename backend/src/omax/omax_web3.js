const dotenv = require('dotenv');

const { config } = require('../config');
const { Token,
    TokenPrice
} = require('../db');
const { sleep } = require('../utils/basic');
const { getWalletFromPrivateKey,
    mySendAndConfirmTransaction
} = require('./utils');
const { createPool,
    getPoolInfo
} = require('./pool');
const { getTokenBalance,
    burnTokens
} = require('./engine');
const { pumpfunabi } = require('./pumpfun');
const { erc20abi } = require('./erc20');
const { ethers } = require('ethers');

dotenv.config();

const adminWallet = getWalletFromPrivateKey(process.env.ADMIN_PRIVKEY);

const contrct_curvInfo = async (tokenAddr) => {
    let pumpfunContract = null;
    try {
        pumpfunContract = new ethers.Contract(config.pumpfunAddress, pumpfunabi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return null;
    }

    const curveInfo = await pumpfunContract.curveInfo(tokenAddr);
    return curveInfo;
};

const contract_withdraw = async (baseToken) => {
    // console.log('contract_withdraw - start');

    // const admin = adminWallet.publicKey;
    // const program = getProgram(adminWallet);
    // const mainStateKey = await Keys.getMainStateKey();
    // const mainStateInfo = await program.account.mainState.fetch(mainStateKey);
    // if (!mainStateInfo)
    //     throw new Error("Failed to fetch mainState!");

    // const owner = mainStateInfo.owner;

    // const baseMint = new PublicKey(baseToken);
    // if (!baseMint) {
    //     throw new Error("Invalid token");
    // }
    // const quoteMint = NATIVE_MINT;
    // const poolStateKey = await Keys.getPoolStateKey(baseMint, quoteMint);

    // const reserverBaseAta = getAssociatedTokenAddressSync(baseMint, poolStateKey, true);
    // const reserverQuoteAta = getAssociatedTokenAddressSync(quoteMint, poolStateKey, true);
    // const adminBaseAta = getAssociatedTokenAddressSync(baseMint, admin);
    // const adminQuoteAta = getAssociatedTokenAddressSync(quoteMint, admin);

    // const tx = new Transaction().add(
    //     await program.methods
    //         .withdraw()
    //         .accounts({
    //             admin, owner, 
    //             mainState: mainStateKey, 
    //             poolState: poolStateKey, 
    //             baseMint, quoteMint, 
    //             reserverBaseAta, reserverQuoteAta, 
    //             adminBaseAta, adminQuoteAta, 
    //             systemProgram: SystemProgram.programId, 
    //             tokenProgram: TOKEN_PROGRAM_ID, 
    //             associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    //         })
    //     // .preInstructions([web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })]);
    //     .instruction()
    // );

    // const txHash = await mySendAndConfirmTransaction(connection, adminWallet, tx, {
    //     maxRetries: 0
    // });
    // console.log('  withdraw txHash:', txHash);

    // return txHash;
    return ""
};

function splitHexIntoChunks(hex, chunkSize = 64) {
    if (!hex.startsWith("0x")) throw new Error("Hex string must start with '0x'");
    
    hex = hex.slice(2); // Remove '0x'
    const chunks = [];

    for (let i = 0; i < hex.length; i += chunkSize * 2) {
        chunks.push("0x" + hex.slice(i, i + chunkSize * 2)); // Re-add '0x' prefix
    }

    return chunks;
}

const onCreateEvent = async (log) => {
    const creator = ethers.getAddress("0x" + log.topics[1].slice(26));
    const tokenAddr = ethers.getAddress("0x" + log.topics[2].slice(26));
    // const datas = splitHexIntoChunks(log.data);
    const price = ethers.toBigInt(log.data);
    let token = await Token.findOne({ tokenAddr: tokenAddr });
    if (token) {
        console.error(`Already registered token with tokenAddr ${tokenAddr}`);
        return;
    }

    token = new Token({
        tokenAddr: tokenAddr, 
        cdate: Date.now()
    });
    await token.save();

    const tokenPrice = new TokenPrice({
        tokenId: token._id, 
        baseReserve: Number(ethers.parseEther(config.initVirtBase).toString()), 
        quoteReserve: Number(ethers.parseEther(config.initVirtQuote).toString()), 
        price: Number(price.toString()) / config.priceDenom, 
        timestamp: Date.now()
    });
    await tokenPrice.save();
};

const onTradeEvent = async (log) => {
    const trader = ethers.getAddress("0x" + log.topics[1].slice(26));
    const tokenAddr = ethers.getAddress("0x" + log.topics[2].slice(26));
    const datas = splitHexIntoChunks(log.data);
    const isBuy = ethers.toBigInt(datas[0]);
    const amount = ethers.toBigInt(datas[1]);
    const eth = ethers.toBigInt(datas[2]);
    const latestPrice = ethers.toBigInt(datas[3]);
    const token = await Token.findOne({ tokenAddr: tokenAddr });
    if (!token) {
        console.error(`Failed to find token with the tokenAddr ${tokenAddr}`);
        return;
    }

    const curveInfo = await contrct_curvInfo(tokenAddr);
    const tokenPrice = new TokenPrice({
        tokenId: token._id, 
        baseReserve: Number(curveInfo.vY) - Number(curveInfo.supply), 
        quoteReserve: Number(curveInfo.vX) + Number(curveInfo.funds),
        price: Number(latestPrice.toString()) / config.priceDenom, 
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

const onKoHEvent = async (log) => {
    const tokenAddr = ethers.getAddress("0x" + log.topics[1].slice(26));
    const buyer = ethers.getAddress("0x" + log.topics[2].slice(26));
    const amount = ethers.toBigInt(log.data);
    const token = await Token.findOne({ tokenAddr: tokenAddr });
    if (!token) {
        console.error(`Failed to find token with the tokenAddr ${tokenAddr}`);
        return;
    }

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
};

const onCompleteEvent = async (log) => {
    const tokenAddr = ethers.getAddress("0x" + log.topics[1].slice(26));
    const token = await Token.findOne({ tokenAddr: tokenAddr });
    if (!token) {
        console.error(`Failed to find token with the tokenAddr ${tokenAddr}`);
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

let lastCheckedBlock = 6961915;
const curveCreatedTopic = ethers.id("CurveCreated(address,address,uint256)");
const curveCompletedTopic = ethers.id("CurveCompleted(address)");
const curveLaunchedTopic = ethers.id("CurveLaunched(address)");
const kingOfTheHillTopic = ethers.id("KingOfTheHill(address,address,uint256)");
const swapTopic = ethers.id("Swap(address,address,bool,uint256,uint256,uint256)");

exports.captureEvents = async () => {
    const latestBlock = await config.provider.getBlockNumber();
    if (lastCheckedBlock === 0) {
        lastCheckedBlock = latestBlock - 10; // Start from a few blocks behind
    }
    console.log(`Checking events from block ${lastCheckedBlock} to ${latestBlock}...`);
    const logs = await config.provider.getLogs({
        fromBlock: lastCheckedBlock,
        toBlock: latestBlock,
        address: config.pumpfunAddress,
        topics: [[curveCreatedTopic, curveCompletedTopic, curveLaunchedTopic, kingOfTheHillTopic, swapTopic]],
    });

    logs.forEach(log => {
        const eventTopic = log.topics[0]; // Identify the event type

        if (eventTopic === curveCreatedTopic) {
            onCreateEvent(log);
        } else if (eventTopic === curveCompletedTopic) {
            onCompleteEvent(log);
        } else if (eventTopic === curveLaunchedTopic) {
            console.log("launchLog: ", log);
        } else if (eventTopic === kingOfTheHillTopic) {
            onKoHEvent(log);
        } else if (eventTopic === swapTopic) {
            onTradeEvent(log);
        }

        // if (eventTopic === transferTopic) {
        //     const from = "0x" + log.topics[1].slice(26);
        //     const to = "0x" + log.topics[2].slice(26);
        //     const amount = BigInt(log.data).toString();
        //     console.log(`Transfer Event: ${from} -> ${to}, Amount: ${amount}`);
        // } else if (eventTopic === approvalTopic) {
        //     const owner = "0x" + log.topics[1].slice(26);
        //     const spender = "0x" + log.topics[2].slice(26);
        //     const value = BigInt(log.data).toString();
        //     console.log(`Approval Event: ${owner} approved ${spender} for ${value}`);
        // }
    });

    lastCheckedBlock = latestBlock + 1; // Move forward

    // console.log('capturing events...');

    // const program = getProgram(adminWallet);

    // const listenerCreateEvent = program.addEventListener('CreateEvent', async (event, slot) => {
    //     console.log('createEvent:', event);
    //     await onCreateEvent(event);
    // });

    // const listenerTradeEvent = program.addEventListener('TradeEvent', async (event, slot) => {
    //     console.log('tradeEvent:', event);
    //     await sleep(1_000); // sleep to prevent TradeEvent being processed ahead of CreateEvent
    //     await onTradeEvent(event);
    //     // await onCompleteEvent(event);
    // });

    // const listenerCompleteEvent = program.addEventListener('CompleteEvent', async (event, slot) => {
    //     console.log('completeEvent:', event);
    //     await sleep(2_000);
    //     await onCompleteEvent(event);
    // });
};
