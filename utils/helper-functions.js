const { ethers, run } = require("hardhat");

const provider = ethers.provider

const getTransactionFee = async (address, initialEth)=>{

	const lastEth = await provider.getBalance(address)
	const fee = ethers.utils.formatEther(initialEth.sub(lastEth))

	console.log("transaction fee: ", fee, "ETH")
}


const getErc20Balance = async(contract, address, decimals)=>{

	const [balance] = await Promise.all([
		contract.balanceOf(address),
	])

	return parseFloat(ethers.utils.formatUnits(balance, decimals))
}


const verify = async(contractAddress, args)=>{
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

module.exports = {
	verify, 
	getTransactionFee,
	getErc20Balance
}