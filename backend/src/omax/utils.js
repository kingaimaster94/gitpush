
const { config } = require('../config');

const getWalletFromPrivateKey = (privateKey) => {
    if (privateKey.startsWith('0x')) {
        privateKey = privateKey.substring(2)
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const account = config.web3.eth.accounts.privateKeyToAccount(privateKeyBuffer);
    const walletAddress = account.address;
    return { publicKey: walletAddress, privateKey: privateKey };
}

module.exports = { 
    getWalletFromPrivateKey
};
