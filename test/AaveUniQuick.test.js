const { expect } = require("chai");
const { ethers, run, network } = require("hardhat");
const { networkConfig } = require("../networkConfig");
const chainId = network.config.chainId;
const { getTransactionFee, impersonateAddress } = require("../utils/helper-functions");

const MATIC_WHALE = "0xda07f1603a1c514b2f4362f3eae7224a9cdefaf9";

describe("AaveUniQuick", async () => {
	let AaveUniQuickContract;
	let owner;

	const provider = ethers.provider;

    
    const borrow_token = networkConfig[chainId]["WBTC"];
    const DECIMALS = 8
    const aave_borrow_amount = "100.0";
    const pool_pair = networkConfig[chainId]["Weth9"];
    const shared_Address = networkConfig[chainId]["USDT"]; //For multihop swaps

    const flashParams = {
        token0: ethers.utils.getAddress(borrow_token),
        token1: ethers.utils.getAddress(pool_pair),
        pool1Fee: pool1Fee,
        amount0: ethers.utils.parseUnits(aave_borrow_amount, DECIMALS),
        pool2Fee: pool2Fee,
        sharedAddress: ethers.utils.getAddress(shared_Address),
        uniuniquick: false,
        uniunisushi: false,
        uniquick: false,
        unisushi: false, 
        quickuni: false, 
        quicksushi: false,
        sushiuni: false,
        sushiquick: true
    }


	before(async () => {
		// [owner, addr1, ...addrs] = await ethers.getSigners();
        owner = impersonateAddress(MATIC_WHALE)

		await run("balance", { account: owner.address })

		const initialMatic = await provider.getBalance(owner.address)
        const Aave_pool_addresses_provider_v3 = networkConfig[chainId]["Aave_pool_addresses_provider_v3"];
        const UniswapV3Router = networkConfig[chainId]["UniswapV3Router"];
        const SushiswapV2Router = networkConfig[chainId]["SushiswapV2Router"];
        const SushiswapV2Factory = networkConfig[chainId]["SushiswapV2Factory"];
        const QuickswapV2Router = networkConfig[chainId]["QuickswapV2Router"];
        const QuickswapV2Factory = networkConfig[chainId]["QuickswapV2Factory"];

		const contractFactory = await ethers.getContractFactory(
			"AaveUniQuick", owner
		);

		AaveUniQuickContract = await contractFactory.deploy(
			Aave_pool_addresses_provider_v3, 
            UniswapV3Router, 
            SushiswapV2Router, 
            SushiswapV2Factory,
            QuickswapV2Router,
            QuickswapV2Factory
		);
		await AaveUniQuickContract.deployed();
        console.log("Deployed contract to: ", AaveUniQuickContract.address);
		getTransactionFee(owner.address, initialMatic)

	});


	it("Should execute sushiquick swaps", async () => {

        let contract = await ethers.getContractAt("IERC20", borrow_token);

        const initialBalance = await contract.balanceOf(AaveUniQuickContract.address)
        console.log("Contract's initial balance is: ", initialBalance.toString())

		const tx = await AaveUniQuickContract.startTransaction(flashParams);

		expect(tx.hash).to.be.not.null;

		expect(await provider.getTransactionReceipt(tx.hash)).to.be.not.null;

        const endingBalance = await contract.balanceOf(AaveUniQuickContract.address)
	    console.log("Contract's ending balance is: ", endingBalance.toString())

		await run("balance", { account: owner.address })
	});

})