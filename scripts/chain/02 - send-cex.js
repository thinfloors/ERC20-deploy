// This is a script to send tokens to a wallet for CEX listings

const { utils } = require("hardhat").ethers;

const tokenName = "";
const tokenAddress = "";
const amountToSend = 5000000;
const decimals = 18;

const cexWalletAddress = "";

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    // Connect to ERC20
    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    const amount = utils.parseUnits(amountToSend.toString(), decimals);
    console.log(
        `Sending ${amountToSend} units to CEX Wallet at address: ${cexWalletAddress}...`
    );

    const tx = await tokenContract.transfer(cexWalletAddress, amount);
    await tx.wait();

    const cexBalance = utils.formatUnits(
        (await tokenContract.balanceOf(cexWalletAddress)).toString(),
        decimals
    );
    console.log(`Balance of CEX wallet is: ${cexBalance}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
