const { constants, utils } = require("ethers");

const tokenName = "";
const tokenAddress = "";
const ownerAddress = "";
const routerAddress = "";

async function main() {
    const [, owner] = await ethers.getSigners();

    const tokenContract = await hre.ethers.getContractAt(
        tokenName,
        tokenAddress,
        owner
    );

    /*
    const eventFilter = {
        address: tokenAddress,
        topics: [
            utils.id("Approval(address,address,uint256)"),
            utils.hexZeroPad(ownerAddress, 32),
        ],
    };
    */

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

    const approvedAmount = await tokenContract.allowance(
        ownerAddress,
        routerAddress
    );
    console.log(
        `Approved amount for router to spend of owner's tokens: ${approvedAmount}`
    );
}

async function callApproveFn(tokenContract) {
    try {
        const tx = await tokenContract.approve(
            routerAddress,
            constants.MaxUint256
        );

        // Wait for tx to be validated
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction mined: ${receipt.transactionHash}`);
    } catch (error) {
        console.error("Error sending transaction: ", error);
    }
}

main();
