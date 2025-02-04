"use client"

import React, { createContext, useEffect, useState, useContext } from 'react';

import { contract_getMainStateInfo, 
    contract_isInitialized, 
    contract_initMainState, 
    contract_isPoolCreated, 
    contract_createPoolTx, 
    contract_buyTx, 
    contract_sellTx, 
    contract_updateMainStateInfo, 
    contract_isPoolComplete
} from './contracts';


export const ContractContext = createContext();

const ContractContextProvider = ({ children }) => {
    const [txLoading, setTxLoading] = useState(false);

    const walletCtx = useWallet();

    useEffect(() => {
    }, []);


    const getMainStateInfo = async () => {
        return await contract_getMainStateInfo(walletCtx);        
    };

    const isContractInitialized = async () => {
        return await contract_isInitialized(walletCtx);
    };

    const initializeContract = async () => {
        setTxLoading(true);

        try {
            await contract_initMainState(walletCtx);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);
    };

    const isPoolCreated = async (baseToken, quoteMint) => {
        return await contract_isPoolCreated(walletCtx, baseToken, quoteMint);
    };

    const getCreatePoolTx = async (baseToken, baseAmount, quoteMint, quoteAmount) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_createPoolTx(walletCtx, baseToken, baseAmount, quoteMint, quoteAmount);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const getBuyTx = async (token, amount) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_buyTx(walletCtx, token, amount);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const getSellTx = async (token, amount) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_sellTx(walletCtx, token, amount);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const updateMainStateInfo = async (owner, feeRecipient, tradingFee, devMaxBuy, userMaxBuy) => {
        setTxLoading(true);

        try {
            await contract_updateMainStateInfo(walletCtx, owner, feeRecipient, tradingFee, devMaxBuy, userMaxBuy);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);
    };

    const isPoolComplete = async (baseToken, quoteMint) => {
        return await contract_isPoolComplete(walletCtx, baseToken, quoteMint);
    };

    const context = {
        getMainStateInfo, 
        isContractInitialized, 
        initializeContract, 
        getCreatePoolTx, 
        isPoolCreated, 
        getBuyTx, 
        getSellTx, 
        updateMainStateInfo, 
        isPoolComplete
    };

    return <ContractContext.Provider value={context}>{children}</ContractContext.Provider>
};

export const useContract = () => {
    const contractManager = useContext(ContractContext);
    return contractManager || [{}, async () => {}];
};

export default ContractContextProvider;
