const { ethers, run, network } = require("hardhat");

const provider = ethers.provider

const getTransactionFee = async (address, initialMatic)=>{

	const lastMatic = await provider.getBalance(address)
	const fee = ethers.utils.formatEther(initialMatic.sub(lastMatic))

	console.log("transaction fee is: ", `${fee} MATIC`)
}


const getErc20Balance = async(contract, address, decimals)=>{

	const [balance] = await Promise.all([
		contract.balanceOf(address),
	])

	return parseFloat(ethers.utils.formatUnits(balance, decimals))
}


// Function which allows to convert any address to the signer which can sign transactions in a test
const impersonateAddress = async (address) => {
	await network.provider.request({
	  method: 'hardhat_impersonateAccount',
	  params: [address],
	});
	const signer = ethers.provider.getSigner(address);
	signer.address = signer._address;
	return signer;
  };

  	// Function to increase time in mainnet fork
// async function increaseTime(value) {
// 	if (!ethers.BigNumber.isBigNumber(value)) {
// 	  value = ethers.BigNumber.from(value);
// 	}
// 	await ethers.provider.send('evm_increaseTime', [value.toNumber()]);
// 	await ethers.provider.send('evm_mine');
// }


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
	getErc20Balance,
	impersonateAddress
}