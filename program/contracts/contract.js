/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/
require("dotenv").config();
const { ethers, BigNumber, Contract } = require("ethers");
const {
  uniswapV2ABI,
  uniswapV2Router,
  uniswapV3Router,
  uniswapUniversalRouterABI,
} = require("../contracts/const");
const { erc20Abi } = require("./const");
const { uniswapV3ABI } = require("./const");
// const {
//   abi: V3SwapRouterABI,
// } = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json");
// const {
//   abi: PeripheryPaymentsABI,
// } = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/IPeripheryPayments.sol/IPeripheryPayments.json");
// const {
//   abi: MulticallABI,
// } = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/IMulticall.sol/IMulticall.json");
// const {
//   abi: uniswapV2RouterABI,
// } = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

PRIVATE_KEY = process.env.PRIVATE_KEY;

const getRouterContract = (provider, routerAddress) => {
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  routerContract = new ethers.Contract(routerAddress, uniswapV2ABI, signer);
  return routerContract;
};

const getERC20Contract = (provider, tokenAddress) => {
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(tokenAddress, erc20Abi, signer);
};

const getV3RouterContract = (provider, routerV3Address) => {
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(routerV3Address, uniswapV3ABI, signer);
};

const getUniversalRouterContract = (provider, universalRouterAddress) => {
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(
    universalRouterAddress,
    uniswapUniversalRouterABI,
    signer
  );
};

module.exports = {
  getRouterContract,
  getERC20Contract,
  getV3RouterContract,
  getUniversalRouterContract,
};
