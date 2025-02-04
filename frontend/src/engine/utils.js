import axios from "axios";
import { EXPLORER_URL } from "@/contexts/contracts/constants";

export const fetchAPI = async (url, method, data = {}) => {
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

export async function getWalletTokens(address) {
    const url = `${EXPLORER_URL}/api/v2/addresses/${address}/tokens?type=ERC20`;
    const tokenlist = await fetchAPI(url, 'GET');
    let tokens = [];
    if (tokenlist != null && tokenlist.items != null && tokenlist.items.length > 0) {
        for (let i = 0; i < tokenlist.items.length; i++) {
            const tokenInfo = {
                address: tokenlist.items[i].token.address,
                name: tokenlist.items[i].token.name,
                decimals: tokenlist.items[i].token.decimals,
                symbol: tokenlist.items[i].token.symbol,
                total_supply: tokenlist.items[i].token.total_supply,
                value: tokenlist.items[i].value
            };
            tokens.push(tokenInfo);
        }
    }
    return tokens;
};
