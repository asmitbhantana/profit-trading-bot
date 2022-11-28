const routers = [
  {
    routerContract: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    routerName: "Uniswap V2: Router",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    network: "80001",
    chainName: "Mumbai Testnet",
  },
  {
    routerContract: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    routerName: "Uniswap V2: Router",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    network: "80001",
    chainName: "Goerli",
    rpc: "https://icy-wispy-spree.ethereum-goerli.discover.quiknode.pro/3a1e946a00f4719411ecd7868f28232367bb2d65/",
  },
];

module.exports = routers;
