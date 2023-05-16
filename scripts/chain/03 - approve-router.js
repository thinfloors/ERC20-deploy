const { constants } = require("ethers");

const tokenName = "";
const tokenAddress = "";
const routerAddress = "";

async function main() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    // Connect to ERC20
    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    /*
    The following is code to listen for an Approval event
    Has been tested on local network, but am not testing it on testnet right now, due
    to time constraints

    If re-adding it, you will have to change the main function call to just main()
    as it doesn't terminate with the longer function call

    const eventFilter = tokenContract.filters.Approval(routerAddress);

    const eventListener = (owner, spender, value) => {
        console.log("Approval event emitted");
        console.log(`Owner: ${owner}`);
        console.log(`Spender: ${spender}`);
        console.log(`Value: ${value.toString()}`);

        tokenContract.off(eventFilter, eventListener);
    };

    tokenContract.on(eventFilter, eventListener);

    await callApproveFn(tokenContract);

    */

    const tx = await tokenContract.approve(routerAddress, constants.MaxUint256);
    await tx.wait();

    const approvedAmount = await tokenContract.allowance(
        owner.address,
        routerAddress
    );
    console.log(
        `Approved amount for router to spend of owner's tokens: ${approvedAmount}`
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
