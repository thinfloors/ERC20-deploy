require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const { DEPLOYER_PK, W1_PK, W2_PK, W3_PK, W4_PK } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.18",
            },
            {
                version: "0.4.18",
            },
        ],
    },
    networks: {
        sepolia: {
            url: process.env.ALCHEMY_SEPOLIA_URL,
            accounts: [DEPLOYER_PK, W1_PK, W2_PK, W3_PK, W4_PK],
            chainId: 11155111,
        },
        goerli: {
            url: process.env.ALCHEMY_GOERLI_URL,
            accounts: [DEPLOYER_PK, W1_PK, W2_PK, W3_PK, W4_PK],
            chainId: 5,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_KEY,
    },
};
