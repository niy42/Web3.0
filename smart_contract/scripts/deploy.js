
const hre = require("hardhat");
const main = async () => {
    try {
        const Transactions = await hre.ethers.getContractFactory("Transactions");
        const transactions = await Transactions.deploy();

        // Wait for the deployment transaction to be mined
        const receipt = await transactions.waitForDeployment();

        // Check if transaction was successful
        if(receipt){
            console.log("Transactions deployed to: ", await receipt.getAddress());
        } else {
            throw new Error("Error: Contract deployment failed!");
        }
    } catch (error) {
        throw new Error("Error: " + error.message);
    }
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

runMain();


//first contract deployed: 0x66ad88280249B646f37a247D0ba74277D0D9b818