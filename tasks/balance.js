const { task } = require("hardhat/config");

task("balance", "Prints an account's balance")
	.addParam("account", "The account's address")
	.setAction(async (taskArgs, { ethers }) => { //first argument(taskArgs) is a object I passed in. Second argument is hre
		const account = ethers.utils.getAddress(taskArgs.account)
		const provider = ethers.provider;
		const balance = await provider.getBalance(account)

		console.log(ethers.utils.formatEther(balance), "MATIC")
	})