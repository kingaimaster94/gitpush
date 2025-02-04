import { uploadMetadata } from "@/api/token";

export const createMetadata = async(imgFile) => {
    const {imageUrl} = await uploadMetadata(imgFile);
    if (!imageUrl)
        throw new Error("Failed to upload metadata!");

    return {imageUrl};
};
