const axios = require("axios");

const uploadMetadata = async (fileType, fileBuffer) => {
        const formData = new FormData();
    formData.append("file", fileBuffer);

    const metadata = JSON.stringify({
        name: `omax-${Date.now()}`,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
            maxBodyLength: "Infinity",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                Authorization: process.env.PINATA_JWT,
            },
        }
    );
    imageUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
    return {imageUrl};
};

module.exports = { uploadMetadata };
