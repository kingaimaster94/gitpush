
import { Connection, 
    clusterApiUrl
} from "@solana/web3.js";
import { 
    TxVersion, 
    MAINNET_PROGRAM_ID,
    DEVNET_PROGRAM_ID, 
    LOOKUP_TABLE_CACHE,
} from "@raydium-io/raydium-sdk";
import * as dotenv from "dotenv";


dotenv.config();

const IS_MAINNET = process.env.NEXT_PUBLIC_IS_MAINNET || "";

const isMainNet = IS_MAINNET === "true";

export const networkUrl = !isMainNet 
    ? clusterApiUrl("devnet") 
    : 'https://mainnet.helius-rpc.com/?api-key=e0762009-5522-4263-a855-b8fc58a53dc9';
console.log('networkUrl:', networkUrl);
export const PROGRAMIDS = isMainNet ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;
export const BUNDLR_URL = isMainNet ? "https://node1.bundlr.network" : "https://devnet.bundlr.network";
export const addLookupTableInfo = isMainNet ? LOOKUP_TABLE_CACHE : undefined;

export const connection = new Connection(networkUrl, "confirmed");

export const makeTxVersion = TxVersion.V0; // LEGACY
