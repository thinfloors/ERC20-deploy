// This deploys an ERC20 token, WETH and Uniswap, for use only on local hardhat network
// To run, fill out tokenName and tokenSymbol, and if necessary change decimals

const { utils, ContractFactory, BigNumber } = require("hardhat").ethers;

const tokenName = "";
tokenSymbol = "";
const decimals = 18;

const WETH = require("../../artifacts/contracts/WETH.sol/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

async function main() {
    // Deployer is used as generic wallet, owner to own the ERC20 contract
    const [deployer, owner] = await ethers.getSigners();

    // Deploy erc20 token
    const TokenFactory = await hre.ethers.getContractFactory(tokenName, owner);
    const token = await TokenFactory.deploy(
        BigNumber.from(utils.parseUnits("100000000", decimals))
    );
    await token.deployTransaction.wait();
    console.log(
        `Token deployed at address: ${token.address} \nWith owner address: ${token.signer.address}`
    );

    // Print out total supply of ERC20
    const totalSupplyUnformatted = await token.totalSupply();
    const totalSupply = utils.formatUnits(
        totalSupplyUnformatted.toString(),
        decimals
    );
    console.log(totalSupply);

    // Deploy Weth, Uniswap Factory, Uniswap Router
    const Weth = new ContractFactory(WETH.abi, WETH.bytecode, deployer);
    const weth = await Weth.deploy();
    console.log(`Weth deployed to: ${weth.address}`);

    const UniFactory = new ContractFactory(
        factoryArtifact.abi,
        factoryArtifact.bytecode,
        deployer
    );
    const factory = await UniFactory.deploy(deployer.address);
    console.log(`Uniswap factory address: ${factory.address}`);
    console.log(`Uniswap deployer: ${factory.signer.address}`);

    const Router = new ContractFactory(
        routerArtifact.abi,
        routerArtifact.bytecode,
        deployer
    );
    const router = await Router.deploy(factory.address, weth.address);
    console.log(`Uniswap router address: ${router.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
