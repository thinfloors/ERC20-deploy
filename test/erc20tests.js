//require("@nomiclabs/hardhat-ethers");
const hre = require("hardhat");
const { utils, constants, ContractFactory, BigNumber } =
    require("hardhat").ethers;
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");

/*
Fixture function for deploying ERC20 and all helper contracts.  
Basic function is to test pre-trading launch conditions, such as 
restricted trading, only-owner transfer

Advanced is creating a Uniswap pair and adding liquidity
Creating both these functions as the Describe sections are split into
multiple sections post-liquidity, so the code would be too messy to 
repeat multiple times
*/

async function deployContractsAndSetVariablesBasic() {
    const tokenName = "Harambe";
    tokenSymbol = "HARAMBE";
    const supplyToMint = "100000000";
    const decimals = 18;

    const WETH = require("../artifacts/contracts/WETH.sol/WETH9.json");
    const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
    const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");

    const [
        deployer,
        owner,
        recipient,
        blacklist1,
        blacklist2,
        buy1,
        buy2,
        buy3,
        cex,
    ] = await ethers.getSigners();

    // Deploy erc20 token
    const TokenFactory = await hre.ethers.getContractFactory(tokenName, owner);

    const token = await TokenFactory.deploy(
        BigNumber.from(utils.parseUnits(supplyToMint, decimals))
    );
    await token.deployTransaction.wait();
    console.log(
        `Token deployed at address: ${token.address} \nWith owner address: ${token.signer.address}`
    );

    // Deploy Weth
    const Weth = new ContractFactory(WETH.abi, WETH.bytecode, deployer);
    const weth = await Weth.deploy();
    console.log(`Weth deployed to: ${weth.address}`);

    // Deploy Uniswap Factory
    const UniFactory = new ContractFactory(
        factoryArtifact.abi,
        factoryArtifact.bytecode,
        deployer
    );
    const factory = await UniFactory.deploy(deployer.address);
    console.log(`Uniswap factory address: ${factory.address}`);

    // Deploy Uniswap Router
    const Router = new ContractFactory(
        routerArtifact.abi,
        routerArtifact.bytecode,
        deployer
    );
    const router = await Router.deploy(factory.address, weth.address);
    console.log(`Uniswap router address: ${router.address}`);

    return {
        tokenName,
        decimals,
        supplyToMint,
        deployer,
        owner,
        recipient,
        buy1,
        cex,
        token,
        router,
    };
}

async function deployContractAndSetVariablesAdvanced() {
    const tokenName = "Harambe";
    tokenSymbol = "HARAMBE";
    const supplyToMint = "100000000";
    const decimals = 18;

    const WETH = require("../artifacts/contracts/WETH.sol/WETH9.json");
    const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
    const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
    const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

    const [
        deployer,
        owner,
        recipient,
        blacklist1,
        blacklist2,
        buy1,
        buy2,
        buy3,
        cex,
    ] = await ethers.getSigners();

    // Deploy erc20 token
    const TokenFactory = await hre.ethers.getContractFactory(tokenName, owner);

    const token = await TokenFactory.deploy(
        BigNumber.from(utils.parseUnits(supplyToMint, decimals))
    );
    await token.deployTransaction.wait();
    console.log(
        `Token deployed at address: ${token.address} \nWith owner address: ${token.signer.address}`
    );

    // Deploy Weth
    const Weth = new ContractFactory(WETH.abi, WETH.bytecode, deployer);
    const weth = await Weth.deploy();
    console.log(`Weth deployed to: ${weth.address}`);

    // Deploy Uniswap Factory
    const UniFactory = new ContractFactory(
        factoryArtifact.abi,
        factoryArtifact.bytecode,
        deployer
    );
    const factory = await UniFactory.deploy(deployer.address);
    console.log(`Uniswap factory address: ${factory.address}`);

    // Deploy Uniswap Router
    const RouterFactory = new ContractFactory(
        routerArtifact.abi,
        routerArtifact.bytecode,
        deployer
    );
    const router = await RouterFactory.deploy(factory.address, weth.address);
    console.log(`Uniswap router address: ${router.address}`);

    // Create owner-signed contracts for Router and Factory
    const routerInstance = new ethers.Contract(
        router.address,
        routerArtifact.abi,
        owner
    );

    const factoryInstance = new ethers.Contract(
        factory.address,
        factoryArtifact.abi,
        owner
    );

    // Approve tokens to be spent by the router, can do this here as already
    // tested in the basic scenario
    const approvalTx = await token.approve(
        router.address,
        constants.MaxUint256
    );

    // First transfer cex tokens and confirm balance is correct
    await token.transfer(cex.address, utils.parseEther("5000000"));
    const cexBalance = await token.balanceOf(cex.address);

    // Now add liquidity with remaining tokens and 2 eth
    // Need to create router contract from owner's signer
    const alreadySent = BigNumber.from(cexBalance);
    let tokensToSupply = BigNumber.from(await token.totalSupply());
    tokensToSupply = tokensToSupply.sub(alreadySent);
    console.log(
        `Tokens we're supplying: ${utils.formatEther(
            tokensToSupply.toString()
        )}`
    );

    const ethAmount = utils.parseEther("2.0");
    const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

    let overrides = { value: ethAmount };

    const gasEstimate = await routerInstance.estimateGas.addLiquidityETH(
        token.address,
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

    const addLiquidityTx = await routerInstance.addLiquidityETH(
        token.address,
        tokensToSupply,
        tokensToSupply,
        ethAmount,
        owner.address,
        deadline,
        overrides
    );

    await addLiquidityTx.wait();
    const pairAddress = await factoryInstance.getPair(
        token.address,
        weth.address
    );
    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);

    return {
        tokenName,
        decimals,
        supplyToMint,
        deployer,
        owner,
        recipient,
        blacklist1,
        blacklist2,
        buy1,
        buy2,
        buy3,
        cex,
        weth,
        pairArtifact,
        routerArtifact,
        token,
        router,
        routerInstance,
        factory,
        factoryInstance,
        pair,
    };
}

describe("Launch", function () {
    /*
    Testing launch conditions, such as totalSupply as well as the restrictions
    placed on the token like blacklist and pre-trading limits
    Using basic presets
    */
    let tokenName, decimals, deployer, owner, buy1, token, supplyToMint;

    beforeEach(async function () {
        const fixture = await loadFixture(deployContractsAndSetVariablesBasic);
        tokenName = fixture.tokenName;
        decimals = fixture.decimals;
        supplyToMint = fixture.supplyToMint;
        deployer = fixture.deployer;
        owner = fixture.owner;
        buy1 = fixture.buy1;
        token = fixture.token;
        router = fixture.router;
    });

    it("Should have correct number of tokens", async function () {
        const deployedTokens = await token.totalSupply();
        expect(deployedTokens === supplyToMint);
    });

    it("Should correctly transfer tokens to CEX wallet and reject other non-owner transfers", async function () {
        const tokenContract = await hre.ethers.getContractAt(
            tokenName,
            token.address,
            deployer
        );
        // Send from owner to CEX wallet first
        const deployerTx = await token.transfer(deployer.address, 5000000);
        const walletBalance = await token.balanceOf(deployer.address);
        expect(walletBalance).to.be.equal(5000000);

        // Try sending back from CEX wallet to random wallet
        await expect(
            tokenContract.transfer(buy1.address, 100000)
        ).to.be.revertedWith("trading has not started");
    });

    it("Should correctly approve the router to spend owner ERC20 tokens", async function () {
        await token.approve(router.address, constants.MaxUint256);

        const approvedTokens = await token.allowance(
            owner.address,
            router.address
        );

        expect(approvedTokens).to.be.equal(constants.MaxUint256);
    });
});

describe("Uniswap pair", function () {
    // Testing the addition of a pair/liquidity to Uniswap V2 pool
    let token, routerInstance, owner, pair;

    beforeEach(async function () {
        const fixture = await loadFixture(
            deployContractAndSetVariablesAdvanced
        );
        token = fixture.token;
        routerInstance = fixture.routerInstance;
        owner = fixture.owner;
        pair = fixture.pair;
    });

    it("Should approve router to spend ERC20 tokens", async function () {
        expect(
            await token.allowance(owner.address, routerInstance.address)
        ).to.be.equal(constants.MaxUint256);
    });

    it("Should create pair and add liquidity with 2 eth and remaining 95% of tokens", async function () {
        const reserves = await pair.getReserves();
        expect(pair.address).to.not.equal(
            "0x0000000000000000000000000000000000000000"
        );
        console.log(`Pair address: ${pair.address}`);
        console.log(`reserves: ${reserves}`);

        let token0Reserves;
        let token1Reserves;
        if ((await pair.token0()) === token.address) {
            token0Reserves = reserves[0];
            token1Reserves = reserves[1];
        } else {
            token0Reserves = reserves[1];
            token1Reserves = reserves[0];
        }

        expect(token0Reserves).to.be.equal(utils.parseEther("95000000"));
        expect(token1Reserves).to.be.equal(utils.parseEther("2.0"));
    });
});

describe("Setting Rules", function () {
    /*
    Things to test:
    -First buy tiny amount of tokens
    -Set rule for limited
    -Blacklist, test it rejects
    -Burn liquidity tokens
    -Set back rules to no limits
    -Renounce ownership
    */
    let token,
        router,
        routerInstance,
        factoryInstance,
        weth,
        owner,
        deployer,
        cex,
        blacklist,
        pair;

    beforeEach(async function () {
        const fixture = await loadFixture(
            deployContractAndSetVariablesAdvanced
        );
        token = fixture.token;
        router = fixture.router;
        routerInstance = fixture.routerInstance;
        factoryInstance = fixture.factoryInstance;
        weth = fixture.weth;
        deployer = fixture.deployer;
        owner = fixture.owner;
        cex = fixture.cex;
        blacklist1 = fixture.blacklist1;
        pair = fixture.pair;
    });

    it("Should buy small amount of tokens", async function () {
        let ownerTokens = await token.balanceOf(owner.address);
        console.log(`Owner tokens: ${utils.formatEther(ownerTokens)}`);

        const amountIn = utils.parseEther("0.001");
        const amountOutMin = 0;
        const path = [weth.address, token.address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
        let overrides = {
            value: amountIn,
        };

        const gasEstimate =
            await routerInstance.estimateGas.swapExactETHForTokens(
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
        const tradeTx = await routerInstance.swapExactETHForTokens(
            amountOutMin,
            path,
            owner.address,
            deadline,
            overrides
        );
        const swapReceipt = await tradeTx.wait();

        // Get address balances after uniswap trade, separate method of
        // confirmation than above
        ownerTokens = await token.balanceOf(owner.address);
        console.log(`Owner tokens are now: ${ownerTokens}`);
        expect(ownerTokens).to.be.greaterThan(0);
    });

    it("Should stop big trades once setRule is called", async function () {
        await token.setRule(
            true,
            pair.address,
            BigNumber.from("500000000000000000000000"),
            BigNumber.from("100000000000000000000000")
        );

        const amountIn = utils.parseEther("0.0001");
        const amountOutMin = 0;
        const path = [weth.address, token.address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
        let overrides = {
            value: amountIn,
        };

        await expect(
            routerInstance.estimateGas.swapExactETHForTokens(
                amountOutMin,
                path,
                owner.address,
                deadline,
                overrides
            )
        ).to.be.reverted;
    });

    it("Should stop any transfers to blacklisted addresses", async function () {
        const amountIn = utils.parseEther("0.001");
        const amountOutMin = 0;
        const path = [weth.address, token.address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
        let overrides = {
            value: amountIn,
        };

        const gasEstimate =
            await routerInstance.estimateGas.swapExactETHForTokens(
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
        const tradeTx = await routerInstance.swapExactETHForTokens(
            amountOutMin,
            path,
            owner.address,
            deadline,
            overrides
        );
        const swapReceipt = await tradeTx.wait();

        // Get address balances after uniswap trade, separate method of
        // confirmation than above
        ownerTokens = await token.balanceOf(owner.address);

        await token.blacklist(blacklist1.address, true);
        await expect(
            token.transfer(blacklist1.address, 3000)
        ).to.be.revertedWith("Blacklisted");
    });

    it("Should burn liquidity tokens, set rules back to regular, and renounced ownership", async function () {
        const burnAddress = "0x000000000000000000000000000000000000dEaD";

        await token.setRule(
            true,
            pair.address,
            BigNumber.from("500000000000000000000000"),
            BigNumber.from("100000000000000000000000")
        );

        let LPBalance = await pair.balanceOf(owner.address);
        await pair.transfer(burnAddress, LPBalance);
        expect(await pair.balanceOf(owner.address)).to.be.equal(0);

        // Set rules back to unlimited
        await token.setRule(false, pair.address, 0, 0);

        // Renounce ownership
        await token.renounceOwnership();

        expect(
            (await token.owner()) === 0x0000000000000000000000000000000000000000
        );
    });

    it("Should set rules back to unrestricted, then buy tokens from a few different accounts", async function () {
        await token.setRule(
            true,
            pair.address,
            BigNumber.from("500000000000000000000000"),
            BigNumber.from("100000000000000000000000")
        );

        await token.setRule(false, pair.address, 0, 0);

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

        const swapPromises = [];

        for (const wallet of wallets) {
            const connectedContract = router.connect(wallet);
            /*
            console.log(
                `Calling swap function with wallet: ${connectedContract.signer.address}`
            );
            */

            const swapPromise = swapEthForTokens(connectedContract, token);
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

        // Function to swap tokens for eth
        async function swapEthForTokens(connectedContract, token) {
            const amountIn = utils.parseEther("0.04");
            const amountOutMin = 0;
            const path = [weth.address, token.address];
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
            console.log(
                `Swapping for address ${connectedContract.signer.address}`
            );
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
                addressBalance = await token.balanceOf(
                    connectedContract.signer.address
                );
                console.log(`post trade balance: ${addressBalance}`);
            } catch (error) {
                swapReceipt = "No trade";
                addressBalance = 0;
            }

            return { swapReceipt, addressBalance };
        }
    });
});
