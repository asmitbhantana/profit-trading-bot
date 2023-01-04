require("dotenv").config();
const { startWalletMonitor } = require("./monitor/monitor");
const { EvmChain } = require("@moralisweb3/evm-utils");

//connect to the database
require("./database/connection");

const { getEthersProvider } = require("./utils/utils");
const {
  getRouterContract,
  getV3RouterContract,
} = require("./contracts/contract");
const { uniswapV2Router, uniswapV3Router } = require("./contracts/const");
const {
  setConfig,
  addRouter,
  addNewRouter,
  addTokenSlippageFee,
  approveMaxToken,
} = require("./setting/setting");

const { BigNumber } = require("ethers");

//Set Configuration
// setConfig();
// addNewRouter();
// addTokenSlippageFee("0", "0");

// API URL
const API_URL = process.env.GOERLI_RPC;

//Provider
const provider = getEthersProvider(API_URL);

//Uniswap Router Contract
const routerContract = getV3RouterContract(provider, uniswapV3Router);
// const routerContract = getRouterContract(provider, uniswapV2Router);

// approveMaxToken(provider, routerContract.address, routerContract.WETH);
startWalletMonitor(EvmChain.GOERLI, provider, routerContract);
