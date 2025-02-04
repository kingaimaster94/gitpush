
const { 
    PublicKey, 
    SYSVAR_RENT_PUBKEY, 
    SystemProgram, 
    TransactionInstruction
} = require("@solana/web3.js");
const { 
    createInitializeAccountInstruction, 
    getMint 
} = require("@solana/spl-token");
const { Market } = require("@project-serum/serum");
const { 
    InstructionType, 
    MARKET_STATE_LAYOUT_V2, 
    TOKEN_PROGRAM_ID, 
    Token, 
    TxVersion, 
    buildSimpleTransaction, 
    generatePubKey, 
    splitTxAndSigners, 
    struct, 
    u16, 
    u32, 
    u64, 
    u8 
} = require("@raydium-io/raydium-sdk");
const BN = require("bn.js");

const { PROGRAMIDS, 
    addLookupTableInfo, 
    mySendAndConfirmTransaction 
} = require("./utils");


async function makeCreateMarketInstruction(
    connection,
    owner,
    baseInfo,
    quoteInfo,
    lotSize, // 1
    tickSize, // 0.01
    dexProgramId,
    makeTxVersion,
    lookupTableCache
) {
    const market = generatePubKey({ fromPublicKey: owner, programId: dexProgramId });
    const requestQueue = generatePubKey({ fromPublicKey: owner, programId: dexProgramId });
    const eventQueue = generatePubKey({ fromPublicKey: owner, programId: dexProgramId });
    const bids = generatePubKey({ fromPublicKey: owner, programId: dexProgramId });
    const asks = generatePubKey({ fromPublicKey: owner, programId: dexProgramId });
    const baseVault = generatePubKey({ fromPublicKey: owner, programId: TOKEN_PROGRAM_ID });
    const quoteVault = generatePubKey({ fromPublicKey: owner, programId: TOKEN_PROGRAM_ID });
    const feeRateBps = 0;
    const quoteDustThreshold = new BN(100);

    function getVaultOwnerAndNonce() {
        const vaultSignerNonce = new BN(0);
        while (true) {
            try {
                const vaultOwner = PublicKey.createProgramAddressSync([market.publicKey.toBuffer(), vaultSignerNonce.toArrayLike(Buffer, 'le', 8)], dexProgramId);
                return { vaultOwner, vaultSignerNonce };
            }
            catch (e) {
                vaultSignerNonce.iaddn(1);
                if (vaultSignerNonce.gt(new BN(25555)))
                    throw Error('find vault owner error');
            }
        }
    }

    function initializeMarketInstruction(programId, marketInfo) {
        const dataLayout = struct([
            u8('version'),
            u32('instruction'),
            u64('baseLotSize'),
            u64('quoteLotSize'),
            u16('feeRateBps'),
            u64('vaultSignerNonce'),
            u64('quoteDustThreshold'),
        ]);
      
        const keys = [
            { pubkey: marketInfo.id, isSigner: false, isWritable: true },
            { pubkey: marketInfo.requestQueue, isSigner: false, isWritable: true },
            { pubkey: marketInfo.eventQueue, isSigner: false, isWritable: true },
            { pubkey: marketInfo.bids, isSigner: false, isWritable: true },
            { pubkey: marketInfo.asks, isSigner: false, isWritable: true },
            { pubkey: marketInfo.baseVault, isSigner: false, isWritable: true },
            { pubkey: marketInfo.quoteVault, isSigner: false, isWritable: true },
            { pubkey: marketInfo.baseMint, isSigner: false, isWritable: false },
            { pubkey: marketInfo.quoteMint, isSigner: false, isWritable: false },
            // Use a dummy address if using the new dex upgrade to save tx space.
            {
                pubkey: marketInfo.authority ? marketInfo.quoteMint : SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false,
            },
        ]
        .concat(marketInfo.authority ? { pubkey: marketInfo.authority, isSigner: false, isWritable: false } : [])
        .concat(
            marketInfo.authority && marketInfo.pruneAuthority
            ? { pubkey: marketInfo.pruneAuthority, isSigner: false, isWritable: false }
            : [],
        );
      
        const data = Buffer.alloc(dataLayout.span);
        dataLayout.encode(
            {
                version: 0,
                instruction: 0,
                baseLotSize: marketInfo.baseLotSize,
                quoteLotSize: marketInfo.quoteLotSize,
                feeRateBps: marketInfo.feeRateBps,
                vaultSignerNonce: marketInfo.vaultSignerNonce,
                quoteDustThreshold: marketInfo.quoteDustThreshold,
            },
            data,
        );
      
        return new TransactionInstruction({
            keys,
            programId,
            data,
        });
    }

    const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();

    const ZERO = new BN(0);
    const baseLotSize = new BN(Math.round(10 ** baseInfo.decimals * lotSize));
    const quoteLotSize = new BN(Math.round(lotSize * 10 ** quoteInfo.decimals * tickSize));
    if (baseLotSize.eq(ZERO))
        throw Error('lot size is too small');
    if (quoteLotSize.eq(ZERO))
        throw Error('tick size or lot size is too small');

    const ins1 = [];
    const accountLamports = await connection.getMinimumBalanceForRentExemption(165);
    ins1.push(
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: baseVault.seed,
            newAccountPubkey: baseVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: TOKEN_PROGRAM_ID,
        }),
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: quoteVault.seed,
            newAccountPubkey: quoteVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeAccountInstruction(baseVault.publicKey, baseInfo.mint, vaultOwner),
        createInitializeAccountInstruction(quoteVault.publicKey, quoteInfo.mint, vaultOwner),
    );

    const EVENT_QUEUE_ITEMS = 128; // Default: 2978
    const REQUEST_QUEUE_ITEMS = 31; // Default: 63
    const ORDERBOOK_ITEMS = 201; // Default: 909

    const eventQueueSpace = EVENT_QUEUE_ITEMS * 88 + 44 + 48;
    const requestQueueSpace = REQUEST_QUEUE_ITEMS * 80 + 44 + 48;
    const orderBookSpace = ORDERBOOK_ITEMS * 80 + 44 + 48;

    const ins2 = [];
    ins2.push(
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: market.seed,
            newAccountPubkey: market.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(MARKET_STATE_LAYOUT_V2.span),
            space: MARKET_STATE_LAYOUT_V2.span,
            programId: dexProgramId,
        }),
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: requestQueue.seed,
            newAccountPubkey: requestQueue.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(requestQueueSpace),
            space: requestQueueSpace,
            programId: dexProgramId,
        }),
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: eventQueue.seed,
            newAccountPubkey: eventQueue.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(eventQueueSpace),
            space: eventQueueSpace,
            programId: dexProgramId,
        }),
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: bids.seed,
            newAccountPubkey: bids.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId,
        }),
        SystemProgram.createAccountWithSeed({
            fromPubkey: owner,
            basePubkey: owner,
            seed: asks.seed,
            newAccountPubkey: asks.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId,
        }),
        initializeMarketInstruction(
            dexProgramId,
            {
                id: market.publicKey,
                requestQueue: requestQueue.publicKey,
                eventQueue: eventQueue.publicKey,
                bids: bids.publicKey,
                asks: asks.publicKey,
                baseVault: baseVault.publicKey,
                quoteVault: quoteVault.publicKey,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint,
                baseLotSize: baseLotSize,
                quoteLotSize: quoteLotSize,
                feeRateBps: feeRateBps,
                vaultSignerNonce: vaultSignerNonce,
                quoteDustThreshold: quoteDustThreshold,
            }
		),
    );

    const ins = {
        address: {
            marketId: market.publicKey,
            requestQueue: requestQueue.publicKey,
            eventQueue: eventQueue.publicKey,
            bids: bids.publicKey,
            asks: asks.publicKey,
            baseVault: baseVault.publicKey,
            quoteVault: quoteVault.publicKey,
            baseMint: baseInfo.mint,
            quoteMint: quoteInfo.mint,
        },
        innerTransactions: [
            {
                instructions: ins1,
                signers: [],
                instructionTypes: [
                    InstructionType.createAccount,
                    InstructionType.createAccount,
                    InstructionType.initAccount,
                    InstructionType.initAccount,
                ],
            },
            {
                instructions: ins2,
                signers: [],
                instructionTypes: [
                    InstructionType.createAccount,
                    InstructionType.createAccount,
                    InstructionType.createAccount,
                    InstructionType.createAccount,
                    InstructionType.createAccount,
                    InstructionType.initMarket,
                ],
            },
        ]
    };

    return {
        address: ins.address,
        innerTransactions: await splitTxAndSigners({
            connection,
            makeTxVersion,
            computeBudgetConfig: undefined,
            payer: owner,
            innerTransaction: ins.innerTransactions,
            lookupTableCache,
        }),
    };
}

async function createOpenBookMarket(
    connection, 
    payer, 
    baseMint, 
    quoteMint, 
    lotSize, 
    tickSize)
{
    const baseMintInfo = await getMint(connection, baseMint);
    const quoteMintInfo = await getMint(connection, quoteMint);

    const marketAccounts = await Market.findAccountsByMints(connection, baseMint, quoteMint, PROGRAMIDS.OPENBOOK_MARKET);
    if (marketAccounts.length > 0) {
        console.log("Already created OpenBook market!");
        return;
    }

    // console.log("Creating OpenBook Market...", baseMint.toBase58(), lotSize, tickSize, PROGRAMIDS.OPENBOOK_MARKET.toBase58());

    const baseToken = new Token(TOKEN_PROGRAM_ID, baseMint, baseMintInfo.decimals);
    const quoteToken = new Token(TOKEN_PROGRAM_ID, quoteMint, quoteMintInfo.decimals);
    
    // -------- step 1: make instructions --------
    const { innerTransactions, address } = await makeCreateMarketInstruction(
        connection,
        payer.publicKey,
        baseToken,
        quoteToken,
        lotSize,
        tickSize,
        PROGRAMIDS.OPENBOOK_MARKET,
        TxVersion.V0,
		addLookupTableInfo
    );
    // console.log('Market id', address.marketId)

	const recentBlockhash = await connection.getLatestBlockhash('finalized');
	const willSendTxs = await buildSimpleTransaction({
        makeTxVersion: TxVersion.V0,
        payer: payer.publicKey,
        connection,
        innerTransactions: innerTransactions,
        addLookupTableInfo,
		recentBlockhash: recentBlockhash.blockhash
    });

    let txhashes = [];
    for (const tx of willSendTxs) {
        const txhash = await mySendAndConfirmTransaction(connection, payer, tx, {
            maxRetries: 0
        });
        txhashes.push(txhash);
    }
    console.log('createOpenBookMarket txhash:', txhashes);
}


module.exports = { createOpenBookMarket };
