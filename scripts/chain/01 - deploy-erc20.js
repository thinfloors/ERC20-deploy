// This deploys an ERC20 token, WETH and Uniswap, for use only on local hardhat network
// To run, fill out tokenName and tokenSymbol, and if necessary change decimals

const { utils, BigNumber } = require("hardhat").ethers;
const { network, run } = require("hardhat");

const tokenName = "TestCoin";
tokenSymbol = "TST";
const decimals = 18;

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    const tokensToMint = 100000000;
    const tokensToMintParsed = BigNumber.from(
        utils.parseUnits(tokensToMint.toString(), decimals)
    );

    // Deploy erc20 token
    const TokenFactory = await hre.ethers.getContractFactory(tokenName, owner);
    console.log("Deploying contract...");
    const token = await TokenFactory.deploy(tokensToMintParsed);

    const WAIT_BLOCK_CONFIRMATIONS = 6;
    await token.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

    console.log(
        `Token deployed at address: ${token.address} \nOn ${network.name}\nWith owner address: ${token.signer.address}`
    );

    // Print out total supply of ERC20
    const totalSupplyUnformatted = await token.totalSupply();
    const totalSupply = utils.formatUnits(
        totalSupplyUnformatted.toString(),
        decimals
    );
    console.log(`Total supply minted: ${totalSupply}`);

    console.log("Verifying contract on Etherscan...");

    await run("verify:verify", {
        address: token.address,
        contract: "contracts/TestCoin.sol:TestCoin",
        constructorArguments: [tokensToMintParsed],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
