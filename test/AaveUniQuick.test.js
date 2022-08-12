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

		const contractFactory = await ethers.getContractFactory(
			"AaveUniQuick", owner
		);

		AaveUniQuickContract = await contractFactory.deploy(
			Aave_pool_addresses_provider_v3, 
            UniswapV3Router, 
            SushiswapV2Router, 
            SushiswapV2Factory,
            QuickswapV2Router
		);
		await AaveUniQuickContract.deployed();

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

// 	it("Should execute kybuni flash swaps", async () => {

// 		const tx = await contract.initFlash({
// 			token0: ethers.utils.getAddress(baseTokenAddress),
// 			token1: ethers.utils.getAddress(middleTokenAddress),
// 			token2: ethers.utils.getAddress(swapTokenAddress),
// 			fee1: 500,
// 			amount0: ethers.utils.parseUnits("100.0", DECIMALS),
// 			amount1: 0,
// 			fee2: 500,
// 			unikyb: false,
// 		})

// 		expect(tx.hash).to.be.not.null;

// 		expect(await provider.getTransactionReceipt(tx.hash)).to.be.not.null;

// 		await run("balance", { account: owner.address })
// 	})

// 	it('Should return the address of owner.', async () => {
// 		expect(await contract.owner()).to.equal(owner.address)
// 	})

// 	it('Should successfully send erc20 tokens', async () => {

// 		const initialBalance = await token1.balanceOf(addr1.address)

// 		await contract.withdrawToken(
// 			ethers.utils.getAddress(baseTokenAddress),
// 			addr1.address,
// 			1000
// 		)

// 		const expectedBalance = initialBalance.add(ethers.BigNumber.from(1000))
// 		expect(await token1.balanceOf(addr1.address)).to.equal(expectedBalance);

// 	})

// 	it("Should be reverted because it is not called by the owner", async () => {

// 		expect(contract.connect(addr1).withdrawToken(
// 			ethers.utils.getAddress(baseTokenAddress),
// 			addr1.address,
// 			1000
// 		))
// 			.to.be.reverted;
// 	});
})