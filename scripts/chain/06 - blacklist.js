// Script to swap a small amount of eth for our tokens through Uniswap

const { utils } = require("ethers");

const tokenName = "";
const tokenAddress = "";
const blacklistAddress = "";

async function main() {
    const [, owner] = await ethers.getSigners();

    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    try {
        const tx = await tokenContract.blacklist(blacklistAddress, true);
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
