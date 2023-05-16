// Deploy both erc20 and WETH

const { utils, Contract, ContractFactory } = require("ethers");

// deployerAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
// ownerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
// tokenAddr = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";
// routerAddr = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
// factoryAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

async function main() {
    const [, , addr] = await ethers.getSigners();
    const tokenName = "";
    const tokenAddress = "";
    const tokenABI = require(`../../artifacts/contracts/${tokenName}.sol/${tokenName}.json`);

    const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI.abi,
        ethers.provider
    );

    let approvals;
    try {
        approvals = await tokenContract.queryFilter("Approval");
    } catch (e) {
        approvals = "no such event";
    }

    console.log(approvals[0]);

    //let parsedLog = tokenInterface.parseLog(approvals[0]);
    //console.log(parsedLog);

    /*
    // Check approval of router for token
    const allowance = await tokenContract.allowance(
        "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e",
        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    );

    console.log(allowance);
    */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
