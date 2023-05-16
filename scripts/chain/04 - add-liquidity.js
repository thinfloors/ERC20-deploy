// This approves each pair for the Uniswap Router, then

const { utils, BigNumber } = require("ethers");

const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

const tokenName = "";
const tokenAddress = "";
const routerAddress = "";
const factoryAddress = "";

const cexWalletAddress = "";

// Weth is different on mainnet, will need to change
const wethAddress = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";
// const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    // Define the contract connections we'll need
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

    const factoryContract = new ethers.Contract(
        factoryAddress,
        factoryArtifact.abi,
        owner
    );

    // Add liquidity to the pool via the Router

    const cexBalance = await tokenContract.balanceOf(cexWalletAddress);
    let alreadySentOut = BigNumber.from(cexBalance);
    let tokensToSupply = BigNumber.from(await tokenContract.totalSupply());
    tokensToSupply = tokensToSupply.sub(alreadySentOut);
    tokensFormatted = utils.formatEther(tokensToSupply.toString());
    console.log(`Token Supply: ${tokensToSupply}`);
    console.log(`Tokens supplying formatted: ${tokensFormatted}`);

    const ethAmount = utils.parseEther("0.5");
    const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

    console.log(
        `Adding uniswap pair with: \n${tokensFormatted} tokens and \n${utils.formatEther(
            ethAmount.toString()
        )} ether`
    );

    let overrides = { value: ethAmount };

    const gasEstimate = await routerContract.estimateGas.addLiquidityETH(
        tokenAddress,
        tokensToSupply,
        tokensToSupply,
        ethAmount,
        owner.address,
        deadline,
        overrides
    );

    overrides = {
        value: ethAmount,
        gasLimit: gasEstimate,
    };

    // Get the current gas price
    const gasPrice = await owner.getGasPrice();

    // Calculate the total cost in wei (gasEstimate * gasPrice)
    const totalCostWei = gasEstimate.mul(gasPrice);

    // Convert the cost from wei to ether
    const totalCostEther = ethers.utils.formatEther(totalCostWei);

    console.log(`Estimated gas: ${gasEstimate.toString()}`);
    console.log(`Gas price: ${gasPrice.toString()} wei`);
    console.log(`Total cost: ${totalCostEther} ether`);

    const addLiquidityTx = await routerContract.addLiquidityETH(
        tokenAddress,
        tokensToSupply,
        tokensToSupply,
        ethAmount,
        owner.address,
        deadline,
        overrides
    );

    await addLiquidityTx.wait();

    const pairAddress = await factoryContract.getPair(
        tokenAddress,
        wethAddress
    );
    console.log(`Pair address: ${pairAddress}`);

    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);
    let reserves;
    reserves = await pair.getReserves();
    console.log(`Pair address: ${pair.address}`);
    console.log(`reserves: ${reserves}`);

    const lpTokenBalance = await pair.balanceOf(owner.address);
    console.log(`LP Token balance: ${lpTokenBalance}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
