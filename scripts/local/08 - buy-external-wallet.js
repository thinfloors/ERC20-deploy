// Script to swap a small amount of eth for our tokens through Uniswap
// For test cases will need to add a non-owner trade to see if setRule is working

const { utils } = require("ethers");

const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

const tokenName = "";
const tokenAddress = "";
const routerAddress = "";
const wethAddress = "";

const wallets = [
    new ethers.Wallet(
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        ethers.provider
    ),
    new ethers.Wallet(
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        ethers.provider
    ),
    new ethers.Wallet(
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
        ethers.provider
    ),
    new ethers.Wallet(
        "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
        ethers.provider
    ),
];

async function main() {
    const [, owner] = await ethers.getSigners();

    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    const routerContract = new ethers.Contract(
        routerAddress,
        routerArtifact.abi,
        ethers.provider
    );

    // Array for all our transaction promises - we will try and send off each
    // buy request in the same block, so we can't use 'await' for each tx
    const swapPromises = [];

    for (const wallet of wallets) {
        const connectedContract = routerContract.connect(wallet);
        console.log(
            `Calling swap function with wallet: ${connectedContract.signer.address}`
        );

        const swapPromise = swapEthForTokens(connectedContract, tokenContract);
        swapPromises.push(swapPromise);
    }

    try {
        const swapTxResults = await Promise.all(swapPromises);
        console.log("All uniswap transactions returned");
    } catch (error) {
        console.log("Error occured while carrying out swaps");
    }

    const swapTxResults = await Promise.all(swapPromises);

    for (const result of swapTxResults) {
        console.log(
            `Balance ${ethers.utils.formatEther(result.addressBalance)}`
        );
    }
}

async function swapEthForTokens(connectedContract, tokenContract) {
    const amountIn = utils.parseEther("0.04");
    const amountOutMin = 0;
    const path = [wethAddress, tokenAddress];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    let overrides = {
        value: amountIn,
    };

    const gasEstimate =
        await connectedContract.estimateGas.swapExactETHForTokens(
            amountOutMin,
            path,
            connectedContract.signer.address,
            deadline,
            overrides
        );

    overrides = {
        value: amountIn,
        gasLimit: gasEstimate,
    };

    let swapReceipt;
    let addressBalance;
    console.log(`Swapping for address ${connectedContract.signer.address}`);
    try {
        // Carry out Uniswap trade
        const tradeTx = await connectedContract.swapExactETHForTokens(
            amountOutMin,
            path,
            connectedContract.signer.address,
            deadline,
            overrides
        );

        swapReceipt = await tradeTx.wait();
        addressBalance = await tokenContract.balanceOf(
            connectedContract.signer.address
        );
    } catch (error) {
        swapReceipt = "No trade";
        addressBalance = 0;
    }

    return { swapReceipt, addressBalance };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
