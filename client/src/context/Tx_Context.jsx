import React , { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers'
import { api, contractAddress } from '../utils/constants'

const { ethereum, localStorage } = window;
const { isMetaMask } = ethereum;
const TransactionsContext = React.createContext();
const { Contract, providers: { Web3Provider }} = ethers;


// Contract instance
const createEthereumContract = () => {
    try {
        if(typeof ethereum !== 'undefined' && ethereum){
            const provider = new Web3Provider(ethereum);
            const signer = provider.getSigner();
            const tx_Contract = new Contract(contractAddress, api, signer);
    
            return tx_Contract;
        } else {
            throw new Error("No Ethereum object found!");
        }
    } catch (error) {
        console.error(error);
    }
}
// Manages state globally across multiple components
export const useTransactionsProvider = () => (
    useContext(TransactionsContext)
);

// Provides context
const TransactionsProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Updates the form state
    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }
    
    /*const checkMetaMask = async() => {
        while(!ethereum || !isMetaMask){
            await new Promise((resolve) => setTimeout(resolve, 20000));
        }
    }*/

    // Checks at intervals for presence of ethereum object
    const checkMetaMask = () => new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            if(ethereum && isMetaMask){
                clearInterval(checkInterval);
                resolve(true);
            }
        }, 2000);

        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('MetaMask not detected!'));
        }, 6000);
    })
    
    const checkIfWalletIsConnected = async() => {
        try {
            if(!ethereum){
                alert("Please install MetaMask!");
                return;
            }
            await checkMetaMask();
            const accounts = await ethereum.request({ method: 'eth_accounts'});
            if(accounts.length){
                console.log(accounts, " is/are connected to web_app");
                setCurrentAccount(accounts[0]);
                console.log(accounts, ", is now the current account");
            } else {
                alert("Please connect wallet...");
                throw new Error("Not connected to MetaMask");
            }
        } catch (error) {
            console.error(error);
        }
    } 

    const checkIfTransactionExists = async () => {
        try {
            const tx_Contract = createEthereumContract();
            const tx_count = await tx_Contract.getTransactionCount();
            if(tx_count){
                console.log("Available transactions: ", tx_count.toNumber());
                localStorage.setItem('transactionCount', tx_count.toNumber());
                await getAllTransactions();
            } else {
                console.log("No available transaction");
            }
            
        } catch (error) {
            console.error('No existing transactions: ', error.message);
        }
    }

    useEffect(() => {
    checkIfTransactionExists();
    checkIfWalletIsConnected();
    },[]);

    const connectWallet = () => new Promise((resolve, reject) => {
        try {
            if(!ethereum){
                reject(new Error("MetaMask not installed!"));
                return;
            }
            const { request } = ethereum;
            request({
                method: 'eth_requestAccounts',
            }).then((accounts) =>{
                console.log(accounts, " connected to web_app");
                setCurrentAccount(accounts[0]);
                getAllTransactions();   
                resolve(accounts);
            }).catch((error) => {
                console.error(error);
                reject(error)
            })
            
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });

    const sendTransaction = async () => {
        try {
            const tx_Contract = createEthereumContract();
            const { addressTo, amount, keyword, message } = formData;
            const parsedAmount = ethers.utils.parseEther(amount);
            const transaction = await request.ethereum({ 
                method: "eth_sendTransaction",
                params:[{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount,
                }]
            });

            console.log("Transaction_hash: ", transaction);
            const tx_hash = await tx_Contract.addToBlockchain(
                addressTo,
                parsedAmount,
                keyword,
                message,
            );

            setIsLoading(true);
            console.log(`Loading - ${tx_hash.hash}`);
            await tx_hash.wait();

            setIsLoading(false);
            console.log(`Success - ${tx_hash.hash}`);

            const tx_count = tx_Contract.getTransactionCount();
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
            console.error("Error fetching transactions: ", error.message);
            reject(error);
        })

    } catch(error) {
        console.error(error);
        reject(error);
    }
});

  return (
    <TransactionsContext.Provider value={{ 
        handleChange, 
        isLoading, 
        sendTransaction, 
        currentAccount, 
        formData, 
        transactions, 
        transactionCount, 
        connectWallet
        }}>
        {children}
    </TransactionsContext.Provider>
  )
}

export default TransactionsProvider;
