# ERC20 Deployment

This repo contains solidity code for an arbitrary ERC20, as well as ethers.js code for:

-   Deploying the ERC20 token
-   Creating an ETH:ERC20 pair and adding liquidity in Uniswap V2
-   Swapping eth for the ERC20 using Uniswap V2, can do for multiple wallets
    in the same file
-   Sending amounts of your token to an array of wallets
-   Blacklisting addresses
-   Setting rules to restrict trading, this makes it easier to launch and perform necessary functions
    before people can start trading
-   Renouncing ownership
-   Burning liquidity (sending LP tokens to the ETH burner addres)
-   Testing all the above using the local hardhat network

All the above functionality exists separately for the local network and for EVM blockchains.
Local network scripts use standard ethers providers and such, while EVM version requires you
to save private keys in a .env file, which is imported.

## Usage

1 - Clone repo
2 - Install init with 'npm init -y'
3 - Run 'npm install --save-dev hardhat'
4 - Run 'npx hardhat', choose 'Create a Javascript Project'
5 - Run 'npm install'
6 - Run 'npx hardhat compile'

If using local network:

-   Start by running 'npx hardhat scripts/local/01 - deploy-all-contracts.js'
-   From there, you will get a printout of every contract address and the deployer
-   As you go down the list of scripts, you will need to copy paste values either from first script,
    or something from the script you just ran. This will be intuitive
-   At the very least, you need to run 01, 03, 04, and then 07.
-   There is a testing file in test/erc20test.js.
-   There is also a 'contract-actions.js' script which is just there for miscellaneous actions you
    would like to run while going down the list

If using an EVM chain:

-   You will need to specify the network in your commands, and if using anything other than Sepolia
    or Ethereum Mainnet, you will have to add them to the 'hardhat.config.js' file
-   Enter any private keys you have in .env, and make sure this is included in the .gitignore
-   As with the local network scripts, you can start with 01 and go down the list, updating values
    as you go.
