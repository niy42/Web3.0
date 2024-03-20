const { ethers } = require("hardhat");
const hre = require('hardhat');

const main = async () => {
    try {
        const [deployer] = await ethers.getSigners(); // Gets signers for signing deployed contracts
    
        console.log("Verifying contract...");
    
        const contractAddress = "0x66ad88280249B646f37a247D0ba74277D0D9b818";
    
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [],
        });
    
        console.log("Contract verified!");
        
    } catch (error) {
        console.error(error);
        
    }
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error("Error: ", error);
        process.exit(1);
    }
}

runMain();