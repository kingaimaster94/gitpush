import { TOKEN_DECIMALS, 
    TOKEN_TOTAL_SUPPLY 
} from "./consts";
import { connection } from "./config";
import { Keypair, 
    SystemProgram, 
    PublicKey, 
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, 
    MINT_SIZE, 
    AuthorityType, 
    getMinimumBalanceForRentExemptMint, 
    createInitializeMintInstruction, 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction, 
    createMintToInstruction, 
    createSetAuthorityInstruction
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction, 
    PROGRAM_ID, 
} from "@metaplex-foundation/mpl-token-metadata";
import { uploadMetadata } from "@/api/token";


const createMint = async(mintAuthority, freezeAuthority, decimals) => {
    const keypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const ixs = [
        SystemProgram.createAccount({
            fromPubkey: mintAuthority, 
            newAccountPubkey: keypair.publicKey, 
            space: MINT_SIZE, 
            lamports, 
            programId: TOKEN_PROGRAM_ID
        }), 
        createInitializeMintInstruction(
            keypair.publicKey, 
            decimals, 
            mintAuthority, 
            freezeAuthority, 
            TOKEN_PROGRAM_ID
        )
    ];

    return { keypair, ixs };
};

const mintToken = async(mint, mintAuthority, mintAmount, decimals) => {
    // console.log(`Minting tokens with mint ${mint} amount ${mintAmount}...`);

    const tokenAta = await getAssociatedTokenAddress(mint, mintAuthority);

    let ixs = [
        createAssociatedTokenAccountInstruction(mintAuthority, 
            tokenAta, 
            mintAuthority, 
            mint
        ), 
        createMintToInstruction(mint, 
            tokenAta, 
            mintAuthority, 
            mintAmount * BigInt(10 ** decimals)
        )
    ];

    return ixs;
}

const createMetadata = async(walletCtx, mint, name, symbol, description, imgBuffer, imgFile, websiteLink, twitterLink, tgLink, mintAuthority, updateAuthority) => {
    // console.log(`Creating metadata with mint ${mint}...`);

    const metadata = {
        name,
        symbol,
        description,
        website: websiteLink,
        twitter: twitterLink,
        telegram: tgLink
    };

    const {imageUrl, metadataUri} = await uploadMetadata(imgFile, metadata);
    if (!imageUrl || !metadataUri)
        throw new Error("Failed to upload metadata!");

    const [metadataPDA] = await PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"), 
            PROGRAM_ID.toBuffer(), 
            mint.toBuffer()
        ], 
        PROGRAM_ID
    );
    // console.log(`  Got metadataAccount address: ${metadataPDA}`);

    // on-chain metadata format
    const tokenMetadata = {
        name, 
        symbol, 
        uri: metadataUri, 
        sellerFeeBasisPoints: 0, 
        creators: null, 
        collection: null, 
        uses: null
    };

    // transaction to create metadata account
    const ix = createCreateMetadataAccountV3Instruction({
            metadata: metadataPDA, 
            mint, 
            mintAuthority, 
            payer: walletCtx.publicKey, 
            updateAuthority
        }, {
            createMetadataAccountArgsV3: {
                data: tokenMetadata, 
                isMutable: true, 
                collectionDetails: null
            }
        }
    );

    return {imageUrl, ix};
};

const revokeMintAuthority = async(mint, mintAuthority) => {
    // console.log(`Revoking mintAuthority of token ${mint}...`);

    const ix = createSetAuthorityInstruction(mint, 
        mintAuthority, 
        AuthorityType.MintTokens, 
        null
    );

    return ix;
};


export const createToken = async(walletCtx, name, ticker, description, imgBuffer, imgFile, websiteLink, twitterLink, tgLink) => {
    // console.log(`${walletCtx.publicKey.toBase58()} is creating a new token with name: '${name}', ticker: '${ticker}', description: '${description}'`);
    // console.log(`  website: '${websiteLink}', twitterLink: '${twitterLink}', telegramLink: '${tgLink}'...`);

    try {
        let createIxs = [];

        /* Step 1 - Create mint (feeAuthority disabled) */
        const { keypair: mintKeypair , ixs: createMintIxs } = await createMint(walletCtx.publicKey, null, TOKEN_DECIMALS);
        createIxs = createMintIxs;
        // console.log('  mint:', mintKeypair.publicKey.toBase58());

        /* Step 2 - Create metadata */
        const {imageUrl, ix: metadataIx} = await createMetadata(walletCtx, mintKeypair.publicKey, name, ticker, description, imgBuffer, imgFile, websiteLink, twitterLink, tgLink, walletCtx.publicKey, walletCtx.publicKey);
        createIxs.push(metadataIx);
        
        /* Step 3 - Mint tokens to owner */
        const mintIxs = await mintToken(mintKeypair.publicKey, walletCtx.publicKey, BigInt(TOKEN_TOTAL_SUPPLY), TOKEN_DECIMALS);
        createIxs = [...createIxs, ...mintIxs];

        /* Step 4 - Revoke mintAuthority */
        const revokeIx = await revokeMintAuthority(mintKeypair.publicKey, walletCtx.publicKey);
        createIxs.push(revokeIx);

        return { mintKeypair, imageUrl, createIxs };
    } catch (err) {
        console.error(`Failed to create token: ${err.message}`);
        throw new Error(`Failed to create token: ${err.message}`);
    }
};
