const fs = require('fs-extra');
const path = require('path');
const { download } = require('thirdweb/storage');
const { createThirdwebClient } = require('thirdweb')
const stream = require('stream');
const { promisify } = require('util');
const sharp = require('sharp');
const dotenv = require('dotenv');
dotenv.config();

const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT,
});

exports.downloadIPFSFile = async (ipfsUrl, saveDir) => {
    try {
        // Ensure directory exists
        await fs.ensureDir(saveDir);

        // Extract filename from URL
        const fileName = path.basename(new URL(ipfsUrl).pathname);
        // Set fixed filenames
        const tempFilePath = path.join(saveDir, "temp.jpeg"); // Temporary file
        const finalFilePath = path.join(saveDir, "logo.png"); // Converted file

        console.log(`Downloading ${fileName} from IPFS...`);

        // Fetch the file from IPFS
        const response = await download({
            client,
            uri: ipfsUrl,
        });

        if (!response.ok) {
            console.error('Error downloading from IPFS:', error);
            return ''
        }

        const writer = fs.createWriteStream(tempFilePath);

        const pipeline = promisify(stream.pipeline);
        await pipeline(response.body, writer);

        console.log(`Downloaded file saved temporarily as: ${tempFilePath}`);

        // Convert to PNG using sharp
        await sharp(tempFilePath)
            .toFormat('png')
            .toFile(finalFilePath);

        console.log(`File converted and saved as: ${finalFilePath}`);

        // Remove temporary file
        await fs.remove(tempFilePath);
        console.log("Temporary file removed.");
        return finalFilePath;
    } catch (error) {
        console.error('Error downloading from IPFS:', error);
        return '';
    }
}

// downloadIPFSFile("https://ipfs.io/ipfs/QmU3uZP3af5tTwm3t9Tb2ZPJ3pUjZ6HGd61DmrL5oHUScc/IMG_5754.jpeg", "0xf3ff0c99dfe3a50C3E1e8ceF4399aF047e75416a");
