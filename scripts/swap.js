const { ethers, network, getNamedAccounts } = require("hardhat");
const { networkConfig } = require("../networkConfig");
const chainId = network.config.chainId;

//Note: Uniswap fee tiers...0.05%, 0.30%, 1%
//i.e 500, 3000, 10000 respectively


async function main() {

	let deployedContractAddress = "0x8e298bf8e95e56ee5ffe1f07bc548e4d702e245d"
	//const [account0] = await ethers.getSigners(); //Gets the accounts array for each network..Also works
	const {deployer} = await getNamedAccounts();
	//This is one of the ways where hardhat-deploy is important.
	// deployments.fixtures(["all"])

	//getContract gives us the most recent deployment of a specified contract
	// const AaveUniQuickContract = await ethers.getContract("AaveUniQuick", deployer); 
	const AaveUniQuickContract = await ethers.getContractAt("AaveUniQuick", deployedContractAddress, deployer);

	const pool1Fee = 3000;
	const pool2Fee = 500;

	// USDC == 6 decimals, USDT == 6 decimals, WBTC == 8 decimals
	const borrow_token = networkConfig[chainId]["Weth9"];
    const DECIMALS = 18;
    const aave_borrow_amount = "1000";
    const pool_pair = networkConfig[chainId]["USDT"];
	const pool_pair_decimal = 1000000 //6 decimals for usdc
    const shared_Address = networkConfig[chainId]["USDT"]; //For multihop swaps
    const QuickswapV2RouterAddress = networkConfig[chainId]["QuickswapV2Router"]; 
    const SushiswapV2RouterAddress = networkConfig[chainId]["SushiswapV2Router"]; 
    const UniswapV3QuoterAddress = networkConfig[chainId]["UniswapV3Quoter"]; 

	//Get beginning balance of token you want to flashloan
	let contract = await ethers.getContractAt("IERC20", borrow_token);
	let QuickswapV2Router = await ethers.getContractAt("IUniswapV2Router02", QuickswapV2RouterAddress);
	let SushiswapV2Router = await ethers.getContractAt("IUniswapV2Router02", SushiswapV2RouterAddress);
	let UniswapV3Quoter = await ethers.getContractAt("IQuoter", UniswapV3QuoterAddress);

	let quickswapPrice = await QuickswapV2Router.getAmountsOut(ethers.utils.parseUnits("1", 18), [borrow_token, pool_pair])
	let sushiswapPrice = await SushiswapV2Router.getAmountsOut(ethers.utils.parseUnits("1", 18), [borrow_token, pool_pair])
	console.log("Quickswap Price",quickswapPrice[1].toString()/pool_pair_decimal)
	console.log("Sushiswap Price",sushiswapPrice[1].toString()/pool_pair_decimal)


	// console.log("---------V3 Price below--------");
	// let uniswapV3PriceOut = await UniswapV3Quoter.quoteExactInputSingle(borrow_token,pool_pair,pool1Fee,ethers.utils.parseUnits("1", 8), 0)
	// console.log("uniswapV3PriceOut: ", uniswapV3PriceOut)

	const initialBalance = await contract.balanceOf(AaveUniQuickContract.address);
	console.log("Contract's initial balance is: ", initialBalance.toString());

	const flashparams = {
        token0: ethers.utils.getAddress(borrow_token),
        token1: ethers.utils.getAddress(pool_pair),
        pool1Fee: pool1Fee,  //Make sure to borrow from a lower fee-tier pool and sell at a higher fee-tier pool
        amount0: ethers.utils.parseUnits(aave_borrow_amount, DECIMALS), //Amount of token0 to borrow from Aave
        pool2Fee: pool2Fee,
        sharedAddress: ethers.utils.getAddress(shared_Address),
        uniuniquick: false,
		uniunisushi: false,
        uniquick: false,
        unisushi: false, 
        quickuni: false, 
        quicksushi: true,
        sushiuni: false,
        sushiquick: false
    }

	// borrow from token0, token1 fee1 pool
	const tx = await AaveUniQuickContract.startTransaction(flashparams);
	// tx.wait(1)
	console.log("The transaction hash is: ",tx.hash);

	//Get ending balance of token you want to flashloan
	const endingBalance = await contract.balanceOf(AaveUniQuickContract.address)
	console.log("Contract's ending balance is: ", endingBalance.toString())

	// //  // 1 ether = 1 * 10^18 wei 
	// // console.log("flash gas ether: ", tx.gasPrice.toNumber() / 1e18)

	//Get profit
	const profit = endingBalance - initialBalance;

	if (profit > 0) {
		console.log(`Congrats! You earned ${profit} !!`);
	}
	console.log("Success!");

}


main().then(() => process.exit(0)).catch(error => {
		console.error(error);
		process.exit(1);
	});
