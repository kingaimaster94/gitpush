
const Arweave = require("arweave");
const { wallet } = require("./arweave_wallet");


// console.log("init start...")
const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
});
// console.log("init end...")

const uploadMetadata = async (fileType, fileBuffer, _metadata) => {
    // upload logo to Arweave
    let transaction;

    try {
        transaction = await arweave.createTransaction({ data: fileBuffer });
        transaction.addTag("Content-Type", fileType);
        await arweave.transactions.sign(transaction, wallet);
    } catch (err) {
        console.log("create & sign transaction error:", err);
        throw new Error("Failed to create & sign transaction!");
    }

    let imageUrl = undefined;
    try {
        const response = await arweave.transactions.post(transaction);
        // console.log(response);

        const id = transaction.id;
        imageUrl = id ? `https://arweave.net/${id}` : undefined;
        // console.log("imageUrl", imageUrl);
    } catch (err) {
        console.error("uploadLogo error: ", err);
        throw new Error("Failed to upload logo!");
    }

    // Upload metadata to Arweave
    const metadata = {
        name: _metadata.name,
        symbol: _metadata.symbol,
        description: _metadata.description,
        image: imageUrl,
        website: _metadata.website,
        twitter: _metadata.twitter,
        telegram: _metadata.telegram
    };
    const metadataRequest = JSON.stringify(metadata);

    const metadataTransaction = await arweave.createTransaction({
        data: metadataRequest,
    });
    metadataTransaction.addTag("Content-Type", "application/json");

    let metadataUri = undefined;
    try {
        await arweave.transactions.sign(metadataTransaction, wallet);

        // console.log("metadata txid", metadataTransaction.id);

        await arweave.transactions.post(metadataTransaction);

        metadataUri = metadataTransaction.id ? `https://arweave.net/${metadataTransaction.id}` : undefined;
    } catch (err) {
        console.error("Upload metadata error: ", err);
        throw new Error("Failed to upload metadata!");
    }

    return {imageUrl, metadataUri};
};


module.exports = { uploadMetadata };
