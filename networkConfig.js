const networkConfig = {
    1: {
        name: "mainnet",
        Aave_pool_addresses_provider_v2: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        UniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        SushiswapV2Factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
        SushiswapV2Router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        // Kyber_Address: "0x818E6FECD516Ecc3849DAf6845e3EC868087B755",  //Legacy old address
        Kyber_Address: "0x9AAb3f75489902f3a48495025729a0AF77d4b11e", //Legacy new address
        Weth9: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7", //Tether
        KNC: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200", //KyberNetworkCrystal
        TUSD: "0x8dd5fbce2f6a956c3022ba3663759011dd51e73e", //TrueUSD
        SUSD: "0x57ab1ec28d129707052df4df418d58a2d46d5f51", //sUSD
        USDS: "0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe", //StableUSD
        PBTC: "0x5228a22e72ccc52d415ecfd199f99d0665e7733b" //ProvableBTC
    },
    137: {
        name: "polygon",
        Aave_pool_addresses_provider_v3: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
        UniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        SushiswapV2Factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
        SushiswapV2Router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        //Note: Quickswap is a fork of Uniswap V2 but on the Polygon chain
        QuickswapV2Router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", //For Polygon
        QuickswapV2Factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", //For Polygon
        Weth9: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        UNI: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
        USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        KNC: "0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C",
        TUSD: "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756",
        LINK: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        AAVE: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", 
        MKR: "0x6f7C932e7684666C9fd1d44527765433e01fF61d",
        BAT: "0x3Cef98bb43d732E2F285eE605a8158cDE967D219",
        CRV: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
        UND: "0x1eba4b44c4f8cc2695347c6a78f0b7a002d26413",
        ONE_INCH: "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f",
        SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
        miMATIC: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
        QUICK: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
        AVAX: "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b",
        SAND: "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
        WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    },
    42: {
        name: "kovan",
        Aave_lending_pool_v2: "0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        UniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        SushiswapV2Factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
        SushiswapV2Router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        weth9: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        DAI: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD", //Aave
        // Kyber_Address: "0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D", //old address
        Kyber_Address: "0xc153eeAD19e0DBbDb3462Dcc2B703cC6D738A37c", //new address

    }

}


const developmentChains = ["hardhat", "localhost"]


module.exports = {
    networkConfig,
    developmentChains,
}