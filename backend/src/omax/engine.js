
const { config } = require('../config/');
const axios = require('axios');
const { User,
    Token: TokenModel
} = require('../db/');
const { ethers } = require('ethers');
const { erc20abi } = require('./erc20');
const { pumpfunabi } = require('./pumpfun');

const fetchAPI = async (url, method, data = {}) => {
    return new Promise(resolve => {
        if (method === "POST") {
            axios.post(url, data).then(response => {
                let json = response.data;
                resolve(json);
            }).catch(error => {
                resolve(null);
            });
        } else {
            axios.get(url).then(response => {
                let json = response.data;
                resolve(json);
            }).catch(error => {
                resolve(null);
            });
        }
    });
};

const getTokensHeld = async (walletAddr) => {
    const url = `${config.scanUrl}/api/v2/addresses/${address}/tokens?type=ERC20`;
    const tokenlist = await fetchAPI(url, 'GET');
    let tokens = [];
    if (tokenlist != null && tokenlist.items != null && tokenlist.items.length > 0) {
        for (let i = 0; i < tokenlist.items.length; i++) {
            const tokenInfo = {
                tokenAddr: tokenlist.items[i].token.address,
                balance: tokenlist.items[i].value
            };
            tokens.push(tokenInfo);
        }
    }
    return tokens;
};

const getTokenHolderDistribution = async (tokenAddr) => {
    console.log('getTokenHolderDistribution - tokenAddr:', tokenAddr);
    const url = `${config.scanUrl}/api/v2/tokens/${tokenAddr}/holders`;
    const tokenHolderlist = await fetchAPI(url, 'GET');
    let holderDistrib = [];
    const token = await TokenModel.findOne({ tokenAddr })?.populate('creatorId');
    const devWallet = token?.creatorId?.walletAddr;
    console.log('  devWallet:', devWallet);
    if (tokenHolderlist != null && tokenHolderlist.items != null && tokenHolderlist.items.length > 0) {
        for (let i = 0; i < tokenHolderlist.items.length; i++) {
            const owner = tokenHolderlist.items[i].address.hash;
            const user = await User.findOne({ walletAddr: owner });
            const balance = tokenHolderlist.items[i].value;
            const totalSupply = tokenHolderlist.items[i].token.total_supply;

            holderDistrib.push({
                walletAddr: owner,
                username: (owner == config.pumpfunAddress) ? owner.substr(0, 6) : user?.username,
                bio: (owner == config.pumpfunAddress) ? 'bonding curve' : (user?.walletAddr === devWallet ? 'dev' : null),
                holdPercent: Number(balance) / Number(totalSupply) * 100
            });
        }
    }
    ret = holderDistrib.sort((a, b) => (b.holdPercent - a.holdPercent));
    return ret;
};

async function getWalletTokenAccounts(wallet) {
    // const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    //     programId: TOKEN_PROGRAM_ID
    // });
    // return walletTokenAccount.value.map((i) => ({
    //     pubkey: i.pubkey,
    //     programId: i.account.owner,
    //     accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    // }));
    return [];
};

async function getTokenBalance(owner, tokenAddr = '') {
    if (tokenAddr === '') {
        return Number(await config.web3.eth.getBalance(owner)) / (10 ** config.tokenDecimals);
    }

    let tokenContract = null;
    try {
        tokenContract = new ethers.Contract(tokenAddr, erc20abi, config.provider);
    } catch (error) {
        console.log('getWalletTokenBalance', error)
        return -1
    }

    if (!tokenContract) {
        return -1;
    }

    try {
        const balance = await tokenContract.balanceOf(owner);
        const tokenBalance = Number(balance) / (10 ** Number(config.tokenDecimals));

        return tokenBalance;

    } catch (error) {
        console.log('getWalletTokenBalance 2', error)
    }

    return -1;
}

const getCurvInfo = async (tokenAddr) => {
    let pumpfunContract = null;
    try {
        pumpfunContract = new ethers.Contract(config.pumpfunAddress, pumpfunabi, config.provider);
    } catch (error) {
        console.log('contract error', error);
        return null;
    }

    const curveInfo = await pumpfunContract.curveInfo(tokenAddr);
    return curveInfo;
};

module.exports = {
    getTokensHeld,
    getTokenHolderDistribution,
    getWalletTokenAccounts,
    getTokenBalance,
    getCurvInfo
};
