import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({
    clientId: "d7a770935e5e9a9d19ddfefa05474a16",
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
