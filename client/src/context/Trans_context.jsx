import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, contractAddress } from '../utils/constants';
import { ethers } from 'ethers';

const { ethereum, localStorage } = window;
const { Contract, providers: { Web3Provider }} = ethers;

const TransactionContext = createContext();

const createEthereumContract = () => {
    try {
        if(typeof ethereum !== 'undefined' && ethereum){
            const provider = new Web3Provider(ethereum);
            const signer = provider.getSigner();
            const tx_Contract = new Contract(contractAddress, api, signer);
            return tx_Contract;
        } else {
            throw new Error("Ethereum Object not found!");
        }
    } catch (error) {
        console.error(error);
    }
}

export const useTransactionsProvider = () => (
    useContext(TransactionContext)
);

const TransactionsProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => (
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value}))
    );
        
    const checkMetaMask = () => {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if(ethereum && ethereum.isMetamask){
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 2000);

            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('MetaMask not detected!'));
            }, 6000);
        });

        
    }
    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum){
                alert("Please install Metamask!");
                return;
            }
            checkMetaMask();
            const accounts = await ethereum.request({ method: 'eth_accounts'});
            if(accounts.length){
                console.log('Ethereum connected accounts: ', accounts);
                setCurrentAccount(accounts[0]);
                console.log(accounts[0], " is now the current account");
            } else {
                alert("Please connect your wallet!...");
            }
        } catch (error) {
            console.error('Wallet not connected!', error);
        }

    }

    const checkIfTransactionExists = async () => {
        try {
            const tx_Contract = createEthereumContract();
            const tx_count = await tx_Contract.getTransactionCount();
            if(tx_count){
                console.log("Existing transactions: ", tx_count.toNumber());
                localStorage.setItem('transactionCount', tx_count.toNumber());
                await getAllTransactions();
            } else {
                console.error(" Unable to fetch data!");
            }
        } catch (error) {
            console.error("Connect wallet to view existing transactions: ", error.message);
        }
    }

    useEffect(() => {
        checkIfTransactionExists();
        checkIfWalletIsConnected();
    }, []);

    // Handling connect wallet with async/await
    /*const connectWallet = async () => {
        try {
            if(!ethereum){
               alert ("Please install MetaMask");
               return;
            }
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
            getAllTransactions();
            console.log(accounts + " Ethereum wallet is connected");
        } catch (error) {
            console.log(error);
        }
    }*/

    // Handling connect wallet with a Promise
    const connectWallet = () => new Promise((resolve, reject) => {
        try {
            if(!ethereum){
                reject(new Error('MetaMask not installed'));
                return;
            }
            const { request } = ethereum;
            request({ method: 'eth_requestAccounts'}).then((accounts) => {
                console.log(accounts + " connected to web_App");
                setCurrentAccount(accounts[0]);
                getAllTransactions();
                resolve(accounts);
            }).catch((error) => {
                console.error('Failed to connect to MetaMask: ', error);
                reject(error);
        })
    } catch (error) {
        console.error(error);
        }
    });
        
  
    const sendTransaction = async () => {
        try {
            if(!ethereum){
                throw new Error("Metamask not installed");
            }
            const tx_Contract = createEthereumContract();
            const { addressTo, amount, keyword, message } = formData;
            const parsedAmount = ethers.utils.parseEther(amount);
            const sent_tx = await ethereum.request({ 
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount.toHexString()
                }]
            });

            console.log("Transaction_hash: ", sent_tx);
            const tx_hash = await tx_Contract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword
            );

            setIsLoading(true);
            console.log(`Loading - ${tx_hash.hash}`);
            await tx_hash.wait();

            setIsLoading(false);
            console.log(`Success - ${tx_hash.hash}`);

            const tx_count = await tx_Contract.getTransactionCount();
            setTransactionCount(tx_count);

            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

    const getAllTransactions = () => new Promise ((resolve, reject) =>{
        try {
            const tx_Contract = createEthereumContract();
            tx_Contract.getAllTransactions().then((availableTransactions) => {
                const structuredTransactions = availableTransactions.map(({ 
                    sender, 
                    receiver, 
                    amount, 
                    keyword, 
                    message, 
                    timestamp }) => ({

                    addressFrom: sender,
                    addressTo: receiver,
                    amount: parseInt(amount.toHexString()) / (10e18),
                    keyword: keyword,
                    message: message,
                    timestamp: new Date(timestamp.toNumber() * 1000).toLocaleString(),
                }));
                
                setTransactions(structuredTransactions);
                console.log(structuredTransactions);
                resolve(availableTransactions);
            }).catch((error) => {
                console.error(error);
                reject(error);
            })

        } catch(error) {
            console.error(error);
        }
    });
    
    return (
    <TransactionContext.Provider value={{ 
        connectWallet, 
        sendTransaction, 
        handleChange, 
        transactions, 
        transactionCount, 
        isLoading, 
        currentAccount, 
        formData, }}>
        {children}
    </TransactionContext.Provider>
  )
}

export default TransactionsProvider;
