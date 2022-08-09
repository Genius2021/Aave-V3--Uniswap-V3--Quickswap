// const { network } = require("hardhat");
// const { developmentChains } = require("./../networkConfig");


// module.exports = async (hre)=>{
//     const {getNamedAccounts, deployments} = hre;
//     const {deploy, log} = deployments;
//     const { deployer } = await getNamedAccounts();
//     const chainId = network.config.chainId;

//     if(developmentChains.includes(network.name)){
//         log("Local network detected. Deploying mocks...");
//         deploy("Your Contract Name", {
//             contract: "Your Contract Name",
//             from: deployer,
//             log: true,
//             args: []
//         });
//         log("Mocks deployed!");
//         log("____________________________________")
//     }

// }

// module.exports.tags = ["all", "mocks"]