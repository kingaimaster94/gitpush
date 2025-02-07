import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT,
});

export const createMetadata = async (imgFile) => {
    const uris = await upload({
        client,
        files: [imgFile],
    });
    console.log("uris: ", uris);
    const imageUrl = uris.replace("ipfs://", "https://ipfs.io/ipfs/");
    return { imageUrl };
};
