import React, { useEffect, useState, createContext, useContext } from 'react';
import { contractAddress, api } from '../utils/constants'
import { ethers } from 'ethers'
export const TransactionContext = createContext();

const { ethereum } = window;
const { Contract, providers: { Web3Provider} } = ethers;

const createEthereumContract = () => {
    try {
        if(typeof ethereum !== 'undefined' && ethereum){
            const provider = new Web3Provider(ethereum);
            const signer = provider.getSigner();
            const tx_Contract = new Contract(contractAddress, api, signer);
            return tx_Contract;
        } else {
            throw new Error('Error: no Ethereum object not found!')
        }
    } catch (error) {
        console.error(error);
    }
}

export const useConnectWallet = () => (
    useContext(TransactionContext)
)

export const TransactionsProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({addressTo: "", amount: "", keyword: "", message: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(window.localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);
    
    // event stores user input
    // Updates the form to reflect current user input
    const handleChange = (e, name) => {
            setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
        }
    
const getAllTransactions = async () => {
    try {
        if(typeof ethereum === 'undefined' && !ethereum){
            alert("Please install MetaMask!");
            return;
        }
        const tx_Contract = createEthereumContract();
        const availableTransactions = await tx_Contract.getAllTransactions();
        const structuredTransactions = availableTransactions.map((tx) => ({
            addressTo: tx.receiver,
            addressFrom: tx.sender,
            timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleDateString(),
            keyword: tx.keyword,
            message: tx.message,
            amount: parseInt(tx.amount.toHexString()) / (10e18),
        }))

        console.log("Available transactions: ", structuredTransactions);
        setTransactions(structuredTransactions)
        

    } catch (error) {
        console.error(error);
    }
}

    const checkMetamask = () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if(ethereum && ethereum.isMetaMask){
                    clearInterval(checkInterval); // Stops the check if Meta Mask is initialized
                    resolve(true); // Meta Mask is installed and initialized
                }
            }, 5000) // checks list of ethereum accounts connected to the site every 5 seconds
        })
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum && typeof ethereum == 'undefined'){
                   alert ("Metamask is not installed!");
                   return;
                }
            await checkMetamask();
            const { request } = ethereum
            const accounts = await request({method: 'eth_accounts'});
            if(accounts.length){
                console.log('Connected Ethereum wallet: ', accounts) 
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                alert ("Please connect Your Ethereum wallet");
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionExist();
    },[]);

   const checkIfTransactionExist = async () => {
        try {
            const tx_Contract = createEthereumContract();
            const transactionCount = await tx_Contract.getTransactionCount();
            console.log("Existing transactions: ", transactionCount.toNumber());
        } catch (error) {
            console.error(error)
        }
    }
 
    const sendTransaction = async () => {
        try {
            // Checks if ethereum object is available
            if(typeof ethereum === null && !ethereum){
               throw new Error("Ethereum object not found");
            }
            // Get form data
            const { addressTo, amount, keyword, message} = formData;

            // Instantiate contract
            const tx_Contract = createEthereumContract();
            console.log(tx_Contract)
            console.log("Ethers: " , ethers);

            // Convert amount to wei
            const parsedAmount = ethers.utils.parseEther(amount);

           // Send Transaction
            const tx = await ethereum.request({ 
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x6250', // 25168 GWEI in hex
                    value: parsedAmount.toHexString(),
                }]
            });
            console.log("TransactionHash: ", tx);
            // Ad transaction to blockchain
            const tx_hash = await tx_Contract.addToBlockchain(
                addressTo, 
                parsedAmount, 
                message, 
                keyword);

            // Update loading state
            setIsLoading(true);
            console.log(`Loading - ${tx_hash.hash}`);
            await tx_hash.wait();

            // Update success state
            setIsLoading(false);
            console.log(`Success - ${tx_hash.hash}`);

            // Update transaction count
            const transactionCount = await tx_Contract.getTransactionCount();
            window.localStorage.setItem("transactionCount", transactionCount);
            setTransactionCount(transactionCount.toNumber());
            

            //reloads the form after suubmitting
            window.location.reload();

        } catch (error) {
            console.error(error);
        }
    }
    const connectWallet = async () => {
        try {
            if(!ethereum){
               return alert ("Please install MetaMask")
            }
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            setCurrentAccount(accounts[0])
            console.log(accounts + " Ethereum wallet is connected");
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <TransactionContext.Provider value={{ 
            connectWallet, 
            currentAccount, 
            formData, 
            sendTransaction, 
            handleChange,
            transactions,
            transactionCount,
            isLoading
            }}>
            {children}
        </TransactionContext.Provider>
    );

}