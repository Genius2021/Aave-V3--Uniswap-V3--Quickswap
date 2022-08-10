const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { networkConfig } = require("../networkConfig");
const chainId = network.config.chainId;

//Note: Uniswap fee tiers...0.05%, 0.30%, 1%
//i.e 500, 3000, 10000 respectively

const pool1Fee = 3000;
const pool2Fee = 500;


//Aave
const borrow_token = networkConfig[chainId]["WBTC"];
const DECIMALS = 8
borrow_amount = "60"   //A string

//Uniswap...The second token in the uniswap borrow pool
const pool_pair = networkConfig[chainId]["Weth9"];
const shared_Address = networkConfig[chainId]["USDT"]; //For multihop swaps


// const aave_borrow_amount = ethers.utils.parseEther("0.00000000000000005");
const aave_borrow_amount = ethers.utils.parseUnits(borrow_amount, DECIMALS);
const isUniUniQuick = false;
const isUniQuick = false;
const isUniSushi = false;
const isQuickUni = false;
const isQuickSushi = false;
const isSushiUni = false;
const isSushiQuick = true;

async function main() {

	// let deployedContractAddress = "0x0d51a0aa274925b43367e77cb063f3405f469ddf"
	//const [account0] = await ethers.getSigners(); //Gets the accounts array for each network..Also works
	const {deployer} = await getNamedAccounts();
	//This is one of the ways where hardhat-deploy is important.
	// deployments.fixtures(["all"])
	//getContract gives us the most recent deployment of a specified contract
	const AaveUniQuickContract = await ethers.getContract("AaveUniQuick", deployer); 
	// const AaveUniQuickContract = await ethers.getContractAt("AaveUniQuick", deployedContractAddress, deployer);


	//Get beginning balance of token you want to flashloan
	let contract = await ethers.getContractAt("IERC20", borrow_token);

	const initialBalance = await contract.balanceOf(AaveUniQuickContract.address)
	console.log("Contract's initial balance is: ", initialBalance.toString())

	const flashparams = {
		token0: ethers.utils.getAddress(borrow_token), 
		token1: ethers.utils.getAddress(pool_pair), 
		pool1Fee: pool1Fee, //Make sure to borrow from a lower fee-tier pool and sell at a higher fee-tier pool 
		amount0: aave_borrow_amount, //Amount of token0 to borrow from Aave
		pool2Fee: pool2Fee,
		sharedAddress: ethers.utils.getAddress(shared_Address),
		uniuniquick: isUniUniQuick,
		uniquick: isUniQuick,
		unisushi: isUniSushi, 
		quickuni: isQuickUni, 
		quicksushi: isQuickSushi,
		sushiuni: isSushiUni,
		sushiquick: isSushiQuick
	};

	// borrow from token0, token1 fee1 pool
	const tx = await AaveUniQuickContract.startTransaction(flashparams);
	// tx.wait(1)

	//Get ending balance of token you want to flashloan
	const endingBalance = await contract.balanceOf(AaveUniQuickContract.address)
	console.log("Contract's ending balance is: ", endingBalance.toString())

	// //  // 1 ether = 1 * 10^18 wei 
	// // console.log("flash gas ether: ", tx.gasPrice.toNumber() / 1e18)

	// //Get profit
	// const profit = endingBalance - initialBalance;

	// if (profit > 0) {
	// 	console.log(`Congrats! You earned ${profit} !!`)
	// }
	console.log("Success!")

}



//I.e get a flashloan of 200 WBTC
main().then(() => process.exit(0)).catch(error => {
		console.error(error);
		process.exit(1);
	});
