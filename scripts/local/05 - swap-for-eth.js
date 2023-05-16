// Script to swap a small amount of eth for our tokens through Uniswap
// For test cases will need to add a non-owner trade to see if setRule is working

const { utils } = require("ethers");

const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-core/build/IUniswapV2Pair.json");

const tokenName = "";
const tokenAddress = "";
const ownerAddress = "";
const routerAddress = "";
const wethAddress = "";

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
        owner
    );

    // Get address balances before uniswap trade
    let ownerEth = utils.formatEther(
        await ethers.provider.getBalance(ownerAddress)
    );
    let ownerTokens = utils.formatUnits(
        (await tokenContract.balanceOf(ownerAddress)).toString(),
        18
    );

    console.log("Owner tokens:");
    console.log(`Eth: ${ownerEth}`);
    console.log(`Token: ${ownerTokens}`);

    const amountIn = utils.parseEther("0.05");
    const amountOutMin = 0;
    const path = [wethAddress, tokenAddress];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    let overrides = {
        value: amountIn,
    };

    const gasEstimate = await routerContract.estimateGas.swapExactETHForTokens(
        amountOutMin,
        path,
        owner.address,
        deadline,
        overrides
    );

    overrides = {
        value: amountIn,
        gasLimit: gasEstimate,
    };

    // Carry out Uniswap trade
    const tradeTx = await routerContract.swapExactETHForTokens(
        amountOutMin,
        path,
        owner.address,
        deadline,
        overrides
    );

    const swapReceipt = await tradeTx.wait();

    // Get address balances after uniswap trade, separate method of
    // confirmation than above
    ownerEth = utils.formatEther(
        await ethers.provider.getBalance(ownerAddress)
    );
    ownerTokens = utils.formatUnits(
        (await tokenContract.balanceOf(ownerAddress)).toString(),
        18
    );

    console.log("Deployer tokens after trade:");
    console.log(`Eth: ${ownerEth}`);
    console.log(`Token: ${ownerTokens}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
