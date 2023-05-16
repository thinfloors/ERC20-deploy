// This approves each pair for the Uniswap Router, then

const { utils, BigNumber } = require("ethers");

const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

const tokenName = "";
const tokenAddress = "";
const routerAddress = "";
const factoryAddress = "";
const wethAddress = "";

async function main() {
    const [deployer, owner] = await ethers.getSigners();

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

    let alreadySentOut = BigNumber.from(utils.parseEther("50000"));
    alreadySentOut = alreadySentOut.mul(4);
    let tokenSupply = BigNumber.from(await tokenContract.totalSupply());
    tokenSupply = tokenSupply.sub(alreadySentOut);
    console.log(`Token Supply: ${tokenSupply}`);
    const tokenSupplyFormatted = utils.formatUnits(tokenSupply.toString(), 18);

    const ethAmount = utils.parseEther("2.0");
    const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

    console.log(
        `Adding uniswap pair with: \n${tokenSupplyFormatted} tokens and \n${utils.formatEther(
            ethAmount.toString()
        )} ether`
    );

    let overrides = { value: ethAmount };

    const gasEstimate = await routerContract.estimateGas.addLiquidityETH(
        tokenAddress,
        tokenSupply,
        tokenSupply,
        ethAmount,
        owner.address,
        deadline,
        overrides
    );

    overrides = {
        value: ethAmount,
        gasLimit: gasEstimate,
    };

    const addLiquidityTx = await routerContract.addLiquidityETH(
        tokenAddress,
        tokenSupply,
        tokenSupply,
        ethAmount,
        owner.address,
        deadline,
        overrides
    );

    const liquidityTx = await addLiquidityTx.wait();

    const pairAddress = await factoryContract.getPair(
        tokenAddress,
        wethAddress
    );
    console.log(`Pair address: ${pairAddress}`);

    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, deployer);
    let reserves;
    reserves = await pair.getReserves();
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
