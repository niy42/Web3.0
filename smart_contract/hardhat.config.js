/** @type import('hardhat/config').HardhatUserConfig */

// Moved the require statement for dotenv to the top
require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { ETHERSCAN_API_KEY, ALCHEMY_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: 'sepolia',
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY], // Enclose PRIVATE_KEY in an array
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};