
const { 
	PublicKey
} = require("@solana/web3.js");
const { 
	TOKEN_PROGRAM_ID, 
	getMint, 
} = require("@solana/spl-token");
const { Market } = require("@project-serum/serum");
const { 
	Liquidity, 
	Token, 
	TxVersion, 
	buildSimpleTransaction, 
} = require("@raydium-io/raydium-sdk");
const BN = require("bn.js");

const { config } = require('../config/');
const { getWalletTokenAccounts } = require("./engine");
const { PROGRAMIDS, 
	addLookupTableInfo, 
	mySendAndConfirmTransaction
} = require('./utils');


const createPool = async (connection, payer, baseMint, baseTokenAmount, solAmount) => {
	const baseMintInfo = await getMint(connection, baseMint);
	const baseToken = new Token(TOKEN_PROGRAM_ID, baseMint, baseMintInfo.decimals);
	const quoteToken = Token.WSOL;

	const accounts = await Market.findAccountsByMints(connection, baseToken.mint, quoteToken.mint, PROGRAMIDS.OPENBOOK_MARKET);
	if (accounts.length === 0) {
		console.error("  Failed to find OpenBook market");
		return;
	}
	const marketId = accounts[0].publicKey;
	// console.log('marketId:', marketId);

	const startTime = Math.floor(Date.now() / 1000);
	const baseAmount = baseTokenAmount// * BigInt(10 ** baseToken.decimals);
	const quoteAmount = solAmount// * BigInt(10 ** quoteToken.decimals);
	const walletTokenAccounts = await getWalletTokenAccounts(payer.publicKey);

	const { innerTransactions, address } = await Liquidity.makeCreatePoolV4InstructionV2Simple({
		connection,
		programId: PROGRAMIDS.AmmV4,
		marketInfo: {
			marketId: marketId,
			programId: PROGRAMIDS.OPENBOOK_MARKET,
		},
		baseMintInfo: baseToken,
		quoteMintInfo: quoteToken,
		baseAmount: new BN(baseAmount.toString()),
		quoteAmount: new BN(quoteAmount.toString()),
		startTime: new BN(startTime),
		ownerInfo: {
			feePayer: payer.publicKey,
			wallet: payer.publicKey,
			tokenAccounts: walletTokenAccounts,
			useSOLBalance: true,
		},
		associatedOnly: false,
		checkCreateATAOwner: true,
		makeTxVersion: TxVersion.V0,
		feeDestinationId: new PublicKey(
			config.testMode ? "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR" : "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"
		)
	});
	// console.log('innerTransactions[0].instructions[2]:', innerTransactions[0].instructions[2]);

	const blockRet = await connection.getLatestBlockhash('finalized')
	const willSendTxs = await buildSimpleTransaction({
		makeTxVersion: TxVersion.V0,
		payer: payer.publicKey,
		connection,
		innerTransactions: innerTransactions,
		addLookupTableInfo,
		recentBlockhash: blockRet.blockhash
	});
	// console.log('willSendTxs:', willSendTxs);

	let txhashes = [];
    for (const tx of willSendTxs) {
        const txhash = await mySendAndConfirmTransaction(connection, payer, tx, {
            maxRetries: 0
        });
        txhashes.push(txhash);
    }
    console.log('createPool txhashes:', txhashes);
};

const getPoolInfo = async (connection, baseMint, quoteMint) => {
	const [{ publicKey: marketId, accountInfo }] = 
		await Market.findAccountsByMints(connection, baseMint, quoteMint, PROGRAMIDS.OPENBOOK_MARKET);
	// console.log('  marketId:', marketId);
	let poolKeys = Liquidity.getAssociatedPoolKeys({
		version: 4,
		marketVersion: 3,
		baseMint, 
		quoteMint, 
		baseDecimals: config.tokenDecimals, 
		quoteDecimals: 9, 
		marketId, 
		programId: PROGRAMIDS.AmmV4, 
		marketProgramId: PROGRAMIDS.OPENBOOK_MARKET
	});
	// console.log('  poolKeys:', poolKeys);
	return poolKeys;
};


module.exports = { createPool, 
	getPoolInfo
};
