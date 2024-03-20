import { AiFillPlayCircle  } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { SiEthereum } from "react-icons/si";

import { Loader } from "./"
import { useTransactionsProvider } from "../context/Tx_Context"
import { shortenAddress } from "../utils/shortenAddress";

const commonStyles = "min-h-[70px] sm:px-10 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white"
const Input = ({ placeholder, name, type, handleChange }) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        name={name}
        onChange={(e) => handleChange(e, name)} 
        className="p-2 my-2 w-full rounded-sm outline-none bg-transaparent text-white border-none text-sm white-glassmorphism"/>
    
);
const Welcome = () => {
   const { 
    connectWallet, 
    currentAccount, 
    formData, 
    sendTransaction, 
    handleChange,
    isLoading,
} = useTransactionsProvider();
    
    const handleSubmit = (e) => {
        const { addressTo,  amount, keyword, message } = formData;
        if(!addressTo || !amount ) return;
        
        e.preventDefault();
        sendTransaction();
        console.log("Form submitted successfully")
    }
    return(
        <div className="flex w-full justify-center items-center">
            <div className="flex flex-col mf:flex-row items-start justify-between md:p-20 py-12 px-8">
                <div className="flex flex-col justify-start flex-1 mf:mr-4">
                    <h1 className="sm:text-5xl text-3xl text-white my-2 text-gradient py-1 md:w-full w-11/12">Send Crypto <br/> around the World</h1>
                    <p className="text-base text-white w-11/12 md:9/12 mt-4 mb-4">Explore the crypto world. Buy and sell cryptocurrencies easily on BrokFree</p>
                    {!currentAccount && (<button 
                        type="button" 
                        onClick={connectWallet}
                        className="flex flex-row justify-center items-center md:w-5/12 my-6 w-[180px]
                            bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]">
                                <AiFillPlayCircle className="mr-2 text-white"/>
                                <p className="text-white text-base font-semibold">Connect Wallet</p>
                    </button>)}
                    <div  className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10">
                        <div className={`rounded-tl-2xl ${commonStyles}`}>Reliability</div>
                        <div className={commonStyles}>Security</div>
                        <div className={`rounded-tr-2xl ${commonStyles}`}>Ethereum</div>
                        <div className={`rounded-bl-2xl ${commonStyles}`}>Web3.0</div>
                        <div className={commonStyles}>Low fees</div>
                        <div className={`rounded-br-2xl ${commonStyles}`}>Blockchain</div>
                    </div>

                </div>
                <div className="flex flex-col flex-1 w-full justify-start items-center mf:mt-7 mt-10 md:ml-4">
                    <div className="white-glassmorphism sm:w-72 w-full p-3 h-40 flex flex-col eth-card mb-5">
                        <div className=" flex flex-col justify-between h-full w-full">
                            <div className="flex justify-between items-start h-full w-full">
                                <div className="w-10 h-10 border-2 flex items-center justify-center border-white rounded-full">
                                    <SiEthereum fontSize={21} color="#fff"/>
                                </div>
                                <BsInfoCircle fontSize={17} color="#fff" />
                            </div>
                            <div>
                                <p className="text-white font-light text-sm">{shortenAddress(currentAccount)}</p>
                                <p className="text-white font-semibold text-lg mt-1">Ethereum</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-5 justify-start items-center sm:w-96 w-full blue-glassmorphism">
                        <Input placeholder="Address To" name="addressTo" type="text" handleChange={handleChange}/>
                        <Input placeholder="Amount (ETH)" name="amount" type="number" handleChange={handleChange} />
                        <Input placeholder="Keyword (GIF)" name="keyword" type="text" handleChange={handleChange}/>
                        <Input placeholder="Enter Message" name="message" type="text" handleChange={handleChange}/>
                        <div className="h-[1px] w-full bg-gray-400 my-2" />
                            {isLoading ? (
                                <Loader />
                            ) : (
                            <button
                            type="button"
                            onClick={handleSubmit}
                            className="text-white w-full mt-2 p-2 border-[1px] cursor-pointer border-[#3d4f7c] rounded-full">
                                Submit Now
                            </button>)    
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Welcome;