const fs = require('fs-extra');

exports.createTokenDir = async (tokenAddr) => {
    if (!fs.existsSync(tokenAddr)) {
        fs.mkdirSync(tokenAddr, { recursive: true });
        console.log(`Directory created: ${tokenAddr}`);
    } else {
        console.log(`Directory already exists: ${tokenAddr}`);
    }
}

// createTokenDir("0xf3ff0c99dfe3a50C3E1e8ceF4399aF047e75416a");
