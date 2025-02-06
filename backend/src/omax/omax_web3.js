const dotenv = require('dotenv');

const { config } = require('../config');
const { Token,
    TokenPrice
} = require('../db');
const { sleep } = require('../utils/basic');
const { getWalletFromPrivateKey } = require('./utils');
const { pumpfunabi } = require('./pumpfun');
const { erc20abi } = require('./erc20');
const { factoryabi } = require('./factory');
const { ethers } = require('ethers');

dotenv.config();

const adminWallet = getWalletFromPrivateKey(process.env.ADMIN_PRIVKEY);

async function getTimestampFromBlock(blockNumber) {
    const block = await config.provider.getBlock(blockNumber);
    return block.timestamp;
}

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

const contrct_launchCurve = async (tokenAddr) => {
    let tokenContract = null;
    try {
        tokenContract = new ethers.Contract(tokenAddr, erc20abi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return CSSFontFeatureValuesRule;
    }

    const launched = await tokenContract._launched();
    console.log('launched: ', launched);
    if (launched == true) return true;
    let pumpfunContract = null;
    try {
        pumpfunContract = new ethers.Contract(config.pumpfunAddress, pumpfunabi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return false;
    }

    const account = new ethers.Wallet(adminWallet.privateKey, config.provider);
    const nonce = await account.getNonce();
    const gasPrice = await config.web3.eth.getGasPrice();
    const func = lpContract.getFunction("launchCurve");
    const launchData = await func.populateTransaction(tokenAddr);
    console.log("launch tx: ", launchData);
    const tx = {
        chainId: config.chainId,
        type: 0,
        gasLimit: 200000,
        gasPrice: gasPrice,
        data: launchData.data,
        to: launchData.to,
        nonce: nonce,
    };

    const signedTx = await account.signTransaction(tx);
    const txResponse = await config.web3.eth.sendSignedTransaction(signedTx);
    const result = await config.provider.waitForTransaction(txResponse.transactionHash.toString(), 10);
    if (result.status == 1) {
        return true;
    } else {
        return false;
    }
};

const contrct_burnLP = async (tokenAddr) => {
    let factoryContract = null;
    try {
        factoryContract = new ethers.Contract(config.factoryAddress, factoryabi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return false;
    }

    const lpToken = await factoryContract.getPair(tokenAddr, config.womaxAddress);
    let lpContract = null;
    try {
        lpContract = new ethers.Contract(lpToken, erc20abi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return false;
    }

    const balance = await lpContract.balanceOf(adminWallet.publicKey);
    if (Number(balance) == 0) return true;
    const account = new ethers.Wallet(adminWallet.privateKey, config.provider);
    const nonce = await account.getNonce();
    const gasPrice = await config.web3.eth.getGasPrice();
    const func = lpContract.getFunction("transfer");
    const burnData = await func.populateTransaction("0x0000000000000000000000000000000000000000", balance.toString());
    console.log("burnData: ", burnData);

    const tx = {
        chainId: config.chainId,
        type: 0,
        gasLimit: 200000,
        gasPrice: gasPrice,
        data: burnData.data,
        to: burnData.to,
        nonce: nonce,
    };

    const signedTx = await account.signTransaction(tx);
    console.log("signedTx: ", signedTx)
    const txResponse = await config.web3.eth.sendSignedTransaction(signedTx);
    console.log("txResponse: ", txResponse)
    const result = await config.provider.waitForTransaction(txResponse.transactionHash.toString(), 10);
    if (result.status == 1) {
        return true;
    } else {
        return false;
    }
};

function splitHexIntoChunks(hex, chunkSize = 64) {
    if (!hex.startsWith("0x")) throw new Error("Hex string must start with '0x'");

    hex = hex.slice(2); // Remove '0x'
    const chunks = [];

    for (let i = 0; i < hex.length; i += chunkSize) {
        chunks.push("0x" + hex.slice(i, i + chunkSize)); // Re-add '0x' prefix
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

    const timestamp = await getTimestampFromBlock(log.blockNumber);
    token = new Token({
        tokenAddr: tokenAddr,
        cdate: new Date(timestamp * 1000)
    });
    await token.save();

    const tokenPrice = new TokenPrice({
        tokenId: token._id,
        tokenAmount: 0,
        omaxAmount: 0,
        price: Number(price.toString()) / config.priceDenom,
        timestamp: new Date(timestamp * 1000)
    });
    await tokenPrice.save();
};

const onTradeEvent = async (log) => {
    const trader = ethers.getAddress("0x" + log.topics[1].slice(26));
    const tokenAddr = ethers.getAddress("0x" + log.topics[2].slice(26));
    const datas = splitHexIntoChunks(log.data);
    console.log(datas);
    const isBuy = ethers.toBigInt(datas[0]);
    const amount = ethers.toBigInt(datas[1]);
    const eth = ethers.toBigInt(datas[2]);
    const latestPrice = ethers.toBigInt(datas[3]);
    const token = await Token.findOne({ tokenAddr: tokenAddr });
    if (!token) {
        console.error(`Failed to find token with the tokenAddr ${tokenAddr}`);
        return;
    }

    const timestamp = await getTimestampFromBlock(log.blockNumber);
    const tokenPrice = new TokenPrice({
        tokenId: token._id,
        isBuy: Number(isBuy) == 1 ? true : false,
        tokenAmount: Number(amount),
        omaxAmount: Number(eth),
        price: Number(latestPrice.toString()) / config.priceDenom,
        timestamp: new Date(timestamp * 1000)
    });
    await tokenPrice.save();
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
    const timestamp = await getTimestampFromBlock(log.blockNumber);
    token.koth = true;
    token.crownDate = new Date(timestamp * 1000);
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
        const result = await contrct_launchCurve(tokenAddr);
        console.log('created pool');
    } catch (err) {
        console.error('onCompleteEvent error:', err.message);
    }
};

const onLaunchEvent = async (log) => {
    const tokenAddr = ethers.getAddress("0x" + log.topics[1].slice(26));
    const token = await Token.findOne({ tokenAddr: tokenAddr });
    if (!token) {
        console.error(`Failed to find token with the tokenAddr ${tokenAddr}`);
        return;
    }

    try {
        const result = await contrct_burnLP(tokenAddr);
        console.log('burn liquidity');
    } catch (err) {
        console.error('onLaunchEvent error:', err.message);
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
            onLaunchEvent(log);
        } else if (eventTopic === kingOfTheHillTopic) {
            onKoHEvent(log);
        } else if (eventTopic === swapTopic) {
            onTradeEvent(log);
        }
    });

    lastCheckedBlock = latestBlock + 1; // Move forward
};
