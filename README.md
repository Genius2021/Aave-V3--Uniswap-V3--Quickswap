# Flash Swap Example

Example of Flash Swaps involving
1. Aave
2. Uniswap
3. Quickswap
4. Sushiswap

## Installation and Setup

### 1. Install [Node.js](https://nodejs.org/en/) & [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable), if you haven't already.

### 2. Clone This Repo
Run the following command.
```console
git clone repo clone link
```

## Quickstart
Right now this repo only works with hardhat mainnet fork.

### 1. Setup Environment Variables
You'll need an ALCHEMY_API_KEY environment variable for polygon chain.

Then, you can create a .env file with the following.

```
ALCHEMY_API_KEY='<your-own-alchemy-mainnet-rpc-url>'
```

```
PRIVATE_KEY='<your-own-private-key>'
```

### 2. Install Dependencies
Run the following command.
```console
npm install
```

### 3. Compile Smart Contracts
Run the following command.
```console
npm run compile
```

### 4. Execute Flash Swaps 🔥
Run the following command.
```console
npm run swap
```


