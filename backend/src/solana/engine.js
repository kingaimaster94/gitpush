
const {
    PublicKey, 
    Transaction
} = require('@solana/web3.js');
const { 
    getMint, 
    getAccount, 
    getOrCreateAssociatedTokenAccount, 
    createBurnInstruction,
    getAssociatedTokenAddressSync
} = require("@solana/spl-token");
const { 
	TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
	SPL_ACCOUNT_LAYOUT, 
    Token
} = require("@raydium-io/raydium-sdk");

const { config } = require('../config/');
const { User,
    Token: TokenModel
} = require('../db/');
const { connection, 
    mySendAndConfirmTransaction 
} = require("./utils");


const getTokensHeld = async (walletAddr) => {
    // Convert the wallet address to a publicKey
    const publicKey = new PublicKey(walletAddr);

    // Get the token accounts by owner
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, 
        { programId: TOKEN_PROGRAM_ID }
    );

    // Process and display the results
    const tokens = tokenAccounts.value.map((accountInfo) => {
        const accountData = accountInfo.account.data.parsed.info;
        return { mint: accountData.mint, 
            balance: accountData.tokenAmount.uiAmountString
        };
    });

    return tokens;
};

const getTokenHolderDistribution = async (mintAddr) => {
    let holderDistrib = [];
    console.log('getTokenHolderDistribution - mintAddr:', mintAddr);

    try {
        const token = await TokenModel.findOne({ mintAddr })?.populate('creatorId');
        const devWallet = token?.creatorId?.walletAddr;
        // console.log('  devWallet:', devWallet);

        /* Get totalSupply */
        const mintInfo = await getMint(
            connection, 
            new PublicKey(mintAddr)
        );
        const totalSupply = mintInfo.supply;
        // console.log('  totalSupply:', totalSupply);
        if (totalSupply === BigInt(0))
            return [];

        /* Fetch Token holders */
        const tokenHolders = await connection.getParsedProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
                commitment: "confirmed",
                filters: [
                    {
                        dataSize: 165
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: mintAddr
                        },
                    },
                ],
            }
        );
        // console.log("  Token holders:", tokenHolders);

        for (const accountInfo of tokenHolders) {
            const accountData = accountInfo.account.data;
            const owner = new PublicKey(accountData.parsed.info.owner);
            // console.log('  owner:', owner);

            const user = await User.findOne({ walletAddr: owner?.toBase58() });
            const accountBalance = BigInt(accountData?.parsed.info.tokenAmount.amount);
            // console.log('  accountBalance:', accountBalance);

            const accountInfo2 = await connection.getParsedAccountInfo(owner);
            const owner2 = accountInfo2.value?.owner;
            // console.log('  owner2:', owner2);

            if (accountBalance > BigInt(0)) {
                holderDistrib.push({
                    walletAddr: (owner2 == config.PROGRAM_ID) ? owner.toBase58() : user?.walletAddr, 
                    username: (owner2 == config.PROGRAM_ID) ? owner.toBase58().substr(0, 6) : user?.username, 
                    bio: (owner2 == config.PROGRAM_ID) ? 'bonding curve' : (user?.walletAddr === devWallet ? 'dev' : null), 
                    holdPercent: Number(accountBalance) / Number(totalSupply) * 100
                });
            }
        }
        // console.log('holderDistrib:', holderDistrib);

        ret = holderDistrib.sort((a, b) => (b.holdPercent - a.holdPercent));
        // console.log('ret:', ret);

        return ret;
    } catch (err) {
        console.error(err);
        return [];
    }
};

async function getWalletTokenAccounts(wallet) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
};

async function getTokenBalance(owner, mint) {
    try {
        if (mint.equals(Token.WSOL.mint)) {
            const amount = await connection.getBalance(owner);
            return BigInt(amount);
        } else {
            const ataAddress = getAssociatedTokenAddressSync(
                mint,
                owner,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            // console.log("  ataAddress:", ataAddress);
            if (!ataAddress) return 0;
            
            const tokenAccountInfo = await getAccount(
                connection,
                ataAddress
            );
            if (!tokenAccountInfo) return 0;
            
            // console.log("  tokenAccountInfo:", tokenAccountInfo);
            return tokenAccountInfo.amount;
        }
    } catch (err) {
        console.error(err.message);
        return 0;
    }
}

async function burnTokens(keypair, mint, amount) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mint,
        keypair.publicKey
    );
    // console.log("  tokenAccount:", tokenAccount);

    const recentBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: keypair.publicKey
    })
    .add(
        createBurnInstruction(tokenAccount.address, mint, keypair.publicKey, amount)
    );
    
    const burnSig = await mySendAndConfirmTransaction(connection, keypair, transaction, {
        // skipPreflight: true,
        maxRetries: 0
    });
    console.log("  burnTokens txhash:", burnSig);
}


module.exports = {
    getTokensHeld, 
    getTokenHolderDistribution, 
    getWalletTokenAccounts, 
    getTokenBalance, 
    burnTokens
};
