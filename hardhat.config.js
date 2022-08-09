require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("solidity-coverage");

require("./tasks/accounts");
require("./tasks/balance");
require("./tasks/block-number");

const { ALCHEMY_API_KEY, 
  INFURA_PROJECT_ID, 
  PRIVATE_KEY, 
  ETHERSCAN_API_KEY, 
  POLYGONSCAN_API_KEY } = process.env


const UNISWAP_SETTING = {
  version: "0.7.6",
  settings: {
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
  },
}

module.exports = {
  // solidity: "0.7.6",
  solidity: {
    compilers: [
      {version: "0.7.6"},
      {version: "0.8.0"},
      {version: "0.8.4"},
      UNISWAP_SETTING,
    ],
  },
  paths: {
    artifacts: './src/artifacts',
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
    // apiKey: {
    //   mainnet: ETHERSCAN_API_KEY,
    //   kovan: ETHERSCAN_API_KEY,
    //   polygon: POLYGONSCAN_API_KEY,
    // }
  },
  defaultNetwork: "polygon",
  networks: {
    mainnet: {
      // url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
      chainId: 1,
      blockConfirmations: 5
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      gas: 21000000,
      gasPrice: 35000000000, //35 gwei
      // gasPrice: 47537193041,
      blockConfirmations: 5,
      saveDeployments: true
    },
    kovan: {
      // url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      url: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
      chainId: 42,
      blockConfirmations: 5
    },
    localhost:{  //The hardhat node is similar to ganache-cli
      url: "http://127.0.0.1:8545",
      // accounts:  Hardhat automatically populates it for us,
      chainId: 31337 //This is the same with the hardhat runtime
    },
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 12975788
      }
    }
  },
  namedAccounts:{
    deployer: {
      default: 0,
    },
    user:{
      default: 1
    }
  },
  mocha: {
    timeout: 200000
  }
};
