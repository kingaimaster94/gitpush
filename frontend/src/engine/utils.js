

export async function getWalletTokenAccounts(connection, wallet) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
};

export const sendTransaction = async (connection, walletCtx, transaction) => {
    if (walletCtx.publicKey === null || walletCtx.signTransaction === undefined)
        throw new Error("Invalid wallet!");

    try {
        transaction.feePayer = walletCtx.publicKey;
        const signedTx = await walletCtx.signTransaction(transaction);
        const rawTx = signedTx.serialize();

        // console.log('Sending transaction...');
        const txHash = await connection.sendRawTransaction(rawTx, {
            maxRetries: 0
        });
        return txHash;
    } catch (err) {
        console.error('sendTransaction err:', err);
        throw new Error(err.message);
    }
};

export const send = async (connection, walletCtx, transaction) => {
    if (!transaction.recentBlockhash) {
        const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        transaction.recentBlockhash = blockhash;
    }
    
    try {
        const txHash = await sendTransaction(connection, walletCtx, transaction);
        if (txHash === null) {
            console.error('Transaction failed');
            return;
        }

        // console.log('Confirming transaction...');
        let res = await connection.confirmTransaction(txHash);
        if (res.value.err)
            console.error('Transaction failed');
        else
            console.log('Transaction confirmed');
        return txHash;
    } catch (err) {
        console.error('send err:', err);
        throw new Error(err.message);
    }
};
