

import { PUMPFUN_PROGRAM_ID, 
    MAINSTATE_PREFIX_SEED, 
    POOLSTATE_PREFIX_SEED
} from './constants';


const asyncGetPda = async (seeds, programId) => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};

export const getMainStateKey = async () => {
    const [mainStateKey] = await asyncGetPda([Buffer.from(MAINSTATE_PREFIX_SEED)], 
        PUMPFUN_PROGRAM_ID
    );
    return mainStateKey;
};

export const getPoolStateKey = async (baseMint, quoteMint) => {
    const [poolStateKey] = await asyncGetPda(
        [
            Buffer.from(POOLSTATE_PREFIX_SEED), 
            baseMint.toBuffer(), 
            quoteMint.toBuffer(),
        ], 
        PUMPFUN_PROGRAM_ID
    );
    return poolStateKey;
};

export const getAssociatedTokenAccountKey = async (ownerPubkey, tokenMint) => {
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
