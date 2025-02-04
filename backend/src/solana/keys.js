
const { PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID
} = require('@solana/spl-token');

const { config } = require('../config/');
const { MAINSTATE_PREFIX_SEED, 
    POOLSTATE_PREFIX_SEED
} = require('./constants');


const asyncGetPda = async (seeds, programId) => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};

const getMainStateKey = async () => {
    const [mainStateKey] = await asyncGetPda([Buffer.from(MAINSTATE_PREFIX_SEED)], 
        new PublicKey(config.PROGRAM_ID)
    );
    return mainStateKey;
};

const getPoolStateKey = async (baseMint, quoteMint) => {
    const [poolStateKey] = await asyncGetPda(
        [
            Buffer.from(POOLSTATE_PREFIX_SEED), 
            baseMint.toBuffer(), 
            quoteMint.toBuffer(),
        ], 
        new PublicKey(config.PROGRAM_ID)
    );
    return poolStateKey;
};

const getAssociatedTokenAccountKey = async (ownerPubkey, tokenMint) => {
    let associatedTokenAccountKey = await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(), 
            TOKEN_PROGRAM_ID.toBuffer(), 
            tokenMint.toBuffer()
        ], 
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
    return associatedTokenAccountKey;
};


module.exports = { getMainStateKey, 
    getPoolStateKey, 
    getAssociatedTokenAccountKey
};
