const { ethers, run, network } = require("hardhat");
const { aave_lending_pool_v2, UniswapV3Router, Uniswapv3factory, weth9, KYBER_ADDRESS } = require("./address");

async function main() {
  const AaveUniKyberFactory = await ethers.getContractFactory("AaveUniKyber");

  console.log("Deploying contract...");
  const AaveUniKyber = await AaveUniKyberFactory.deploy(
		aave_lending_pool_v2,
		UniswapV3Router, 
    Uniswapv3factory, 
    ethers.utils.getAddress(weth9), 
    KYBER_ADDRESS
	);
  
  await AaveUniKyber.deployed();
  if(network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY){
    const transactionReceipt = await AaveUniKyber.deployTransaction.wait(5)
    const {gasUsed, effectiveGasPrice} = transactionReceipt;
    const gasCost = gasUsed.mul(effectiveGasPrice);
    console.log("Total gas cost is: ", gasCost);
    await verify(AaveUniKyber.address, [aave_lending_pool_v2, UniswapV3Router, Uniswapv3factory, ethers.utils.getAddress(weth9), KYBER_ADDRESS]);
  }

  console.log("Deployed contract to:", AaveUniKyber.address);
}

async function verify(contractAddress, args){
  console.log("Verifying contract...")
  //You can run any task on hardhat using the run package which I required up there.
  try{
    await run("verify:verify", {address: contractAddress, constructorArguments: args})
  }catch(e){
    if(e.message.toLowerCase().includes("already verified")){
      console.log("Already verified contract!")
    }else{
      console.log(e)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });