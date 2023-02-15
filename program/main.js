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

//Provider
const provider = getEthersProvider(process.env.RPC);

//Uniswap V2 Router Contract
// const routerContract = getRouterContract(provider, process.env.ROUTER);
//Uniswap V3 Router Contract
const routerContract = getV3RouterContract(provider, process.env.ROUTER);

startWalletMonitor(EvmChain.GOERLI, provider, routerContract);
