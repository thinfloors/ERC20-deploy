// 0x821b3480894B5E73D73797931aE05bEc6f9d7D14

// Script to burn liquidity tokens by saying to null address

const { utils } = require("ethers");

const pairAddress = "";
const burnAddress = "0x000000000000000000000000000000000000dEaD";
const tokenArtifact = require("../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const {
    TASK_COMPILE_SOLIDITY_LOG_COMPILATION_RESULT,
    TASK_COMPILE_SOLIDITY_LOG_DOWNLOAD_COMPILER_END,
} = require("hardhat/builtin-tasks/task-names");

async function main() {
    const [, owner] = await ethers.getSigners();

    const tokenContract = new ethers.Contract(
        pairAddress,
        tokenArtifact.abi,
        owner
    );

    let walletBalance = await walletBalanceFn(tokenContract, owner);

    const burnTx = await tokenContract.transfer(burnAddress, walletBalance);

    walletBalanceFn(tokenContract, owner);
}

async function walletBalanceFn(tokenContract, owner) {
    const walletBalance = await tokenContract.balanceOf(owner.address);
    console.log(
        `Owner wallet has: ${utils.formatEther(walletBalance)} LP tokens`
    );
    return walletBalance;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
