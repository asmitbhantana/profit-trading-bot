/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/
require("dotenv").config();
const { ethers, BigNumber, Contract } = require("ethers");
const { uniswapV2ABI, uniswapV2Router } = require("../contracts/const");
const { erc20Abi } = require("./const");

const {
  abi: V3SwapRouterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json");
const {
  abi: PeripheryPaymentsABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/IPeripheryPayments.sol/IPeripheryPayments.json");
const {
  abi: MulticallABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/IMulticall.sol/IMulticall.json");

/*
- Task
- Sell transaction
- Buy transaction
*/

SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;

const getRouterContract = (provider, routerAddress) => {
  const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);
  routerContract = new ethers.Contract(routerAddress, uniswapV2ABI, signer);
  return routerContract;
};

const getERC20Contract = (provider, tokenAddress) => {
  const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);
  return new ethers.Contract(tokenAddress, erc20Abi, signer);
};

const getV3RouterContract = (provider, routerV3Address) => {
  const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);
  return new ethers.Contract(
    routerV3Address,
    V3SwapRouterABI.concat(PeripheryPaymentsABI).concat(MulticallABI),
    signer
  );
};

module.exports = {
  getRouterContract,
  getERC20Contract,
  getV3RouterContract,
};
