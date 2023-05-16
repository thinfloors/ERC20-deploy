// This is a script to send tokens to any chosen wallets before anything commences
// Fill out the token name, token address, any wallets in walletsArray and amount to send
// Note that amount to send doesn't need to take decimals into account, but you can change decimals

/*
Test addresses from hardhat network:
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
0x976EA74026E726554dB657fA54763abd0C3a0aa9
0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
*/

const { utils } = require("hardhat").ethers;

const tokenName = "";
const tokenAddr = "";
const walletsArray = [];
const amountToSend = 50000;
const decimals = 18;

async function main() {
    const [, owner] = await ethers.getSigners();

    // Connect to ERC20
    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddr,
        owner
    );

    const amount = utils.parseUnits(amountToSend.toString(), decimals);
    console.log(`Sending ${amountToSend} units to each wallet...`);

    for (let i = 0; i < walletsArray.length; i++) {
        let wallet = walletsArray[i];
        await tokenContract.transfer(wallet, amount);
        console.log(`Sent ${amount} to ${wallet}`);
    }

    console.log("\nFinal Balances:");
    for (let i = 0; i < walletsArray.length; i++) {
        wallet = walletsArray[i];
        balance = utils.formatUnits(
            (await tokenContract.balanceOf(wallet)).toString(),
            decimals
        );
        console.log(`${wallet}: ${balance}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
