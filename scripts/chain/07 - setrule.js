// Script to swap a small amount of eth for our tokens through Uniswap

const { utils } = require("ethers");

const tokenName = "";
const tokenAddress = "";

const limited = true;
const uniswapV2Pair = "";
const minHoldingAmount = 50000000000000000000000;
const maxHoldingAmount = 60000000000000000000000;

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    try {
        const tx = await tokenContract.setRule(
            limited,
            uniswapV2Pair,
            minHoldingAmount,
            maxHoldingAmount
        );
        console.log(`Transaction sent: ${tx.hash}`);
    } catch (error) {
        console.error(`Transaction failed with error: ${error}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
