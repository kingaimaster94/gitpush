
const { config } = require('../config');
const { sleep } = require('../utils/basic');

const mySendTransaction = async (connection, transaction, signers, options) => {
    // let retries = 50;

    // // console.log('transaction:', transaction);
    // if (transaction instanceof Transaction) {
    //     transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    //     if (signers.length > 0)
    //         transaction.sign(...signers);
    // } else {
    //     if (signers.length > 0)
    //         transaction.sign(signers);
    // }

    // const rawTransaction = transaction.serialize();

    // if (transaction instanceof Transaction) {
    //     let txMsg = {};
    //     try {
    //         txMsg = transaction.compileMessage();
    //     } catch (err) {
    //         console.error("compileMessage error:", err);
    //         throw new Error("Failed to compile message");
    //     }
    // }

    // const expectedTxHash = bs58.encode(transaction.signatures[0].signature || transaction.signatures[0]);

    // const simRes = await connection.simulateTransaction(transaction);
    // if (simRes.value.err !== null) {
    //     console.log('simRes:', simRes.value.err);
    //     throw new Error("Failed to simulate transaction");
    // }
    // console.log('simulated transaction:', expectedTxHash);

    // while (retries > 0) {
    //     try {
    //         await connection.sendRawTransaction(rawTransaction, options);

    //         const sentTime = Date.now();
    //         while (Date.now() - sentTime <= 1500) {
    //             const stat = await connection.getSignatureStatus(expectedTxHash);
    //             if (stat.value?.confirmationStatus == "processed" 
    //                 || stat.value?.confirmationStatus == "confirmed" 
    //                 || stat.value?.confirmationStatus == "finalized")
    //                 return expectedTxHash;

    //             await sleep(500);
    //         }
    //     } catch (err) {
    //         console.error("sendTransaction error:", err.message);
    //     }
    //     retries--;
    // }

    return "";
};

const mySendAndConfirmTransaction = async (connection, payer, transaction, options) => {
    // const signature = await mySendTransaction(connection, transaction, [payer], options);
    // if (signature !== "")
    //     await connection.confirmTransaction(signature);
    // return signature;
    return "";
};


module.exports = { 
    mySendAndConfirmTransaction 
};
