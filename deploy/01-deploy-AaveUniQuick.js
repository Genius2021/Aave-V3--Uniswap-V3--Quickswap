const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../networkConfig");
const { verify } = require("../utils/helper-functions");

//Whenever we run the hardhat-deploy command, hardhat runs the function below and automatically passes the "hre object"
module.exports = async ({getNamedAccounts, deployments})=>{
    const {deploy, log} = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;


    //An easy way to get your parameterized constructor arguments 
    //e.g if chainId is X use Y address
    //Robust script to flip between testnet chain, mainnet chain and local chain

    const Aave_pool_addresses_provider_v3 = networkConfig[chainId]["Aave_pool_addresses_provider_v3"];
    const UniswapV3Router = networkConfig[chainId]["UniswapV3Router"];
    const SushiswapV2Router = networkConfig[chainId]["SushiswapV2Router"];
    const SushiswapV2Factory = networkConfig[chainId]["SushiswapV2Factory"];
    const QuickswapV2Router = networkConfig[chainId]["QuickswapV2Router"];
    const QuickswapV2Factory = networkConfig[chainId]["QuickswapV2Factory"];


    const args = [
        Aave_pool_addresses_provider_v3, 
        UniswapV3Router, 
        SushiswapV2Router, 
        SushiswapV2Factory, 
        QuickswapV2Router, 
        QuickswapV2Factory
    ];
    const AaveUniQuick = await deploy("AaveUniQuick", {
        from: deployer,
        args: args, //your constructor arguments
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });
    
    if(!developmentChains.includes(network.name)){
        // const transactionReceipt = await AaveUniQuick.wait(5);
        // const {gasUsed, effectiveGasPrice} = transactionReceipt;
        // const gasCost = gasUsed.mul(effectiveGasPrice);
        // console.log("Total gas cost is: ", gasCost);
        // await verify(AaveUniQuick.address, args)
    }

    console.log("Deployed contract to: ", AaveUniQuick.address);
    log("______________________________________")

}

module.exports.tags = ["all", "AaveUniQuick"]