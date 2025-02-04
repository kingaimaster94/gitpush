import { jwtDecode } from "jwt-decode";

const STORAGE_KEY = "token";

export function getUserId() {
  const token = localStorage.getItem(STORAGE_KEY)
  if (token === null)
    return null
  const decodedToken = jwtDecode(token)
  return decodedToken.userId
}

export const truncateAddress = (walletAddress, len = 4) => {
  return walletAddress?.slice(0, len) + "..." + walletAddress?.slice(-len);
};