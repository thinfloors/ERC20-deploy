// For miscellaneous operations while building

const { utils } = require("hardhat").ethers;

const tokenName = "TestCoin";
const tokenAddr = "0x57EdA0Ed098Ed065930eF9A86f4b4393672557D9";
const cexWalletAddress = "0x98684c1bcE162aDDE6e65588c73bdC179C500b3b";

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    // Connect to ERC20
    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddr,
        owner
    );

    const cexBalance = await tokenContract.balanceOf(cexWalletAddress);
    console.log(cexBalance);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
