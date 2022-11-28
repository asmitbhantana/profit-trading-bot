require("dotenv").config();
const { startWalletMonitor } = require("./monitor/monitor");

//connect to the database
require("./database/connection");

const { getEthersProvider } = require("./utils/utils");
const { getRouterContract } = require("./contracts/contract");
const { susiswapAddress } = require("./contracts/const");
const { setConfig, addRouter, addNewRouter } = require("./setting/setting");
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require("./monitor/performTxn");
const { BigNumber } = require("ethers");

// API URL
const API_URL = process.env.GOERLI_RPC;

//Provider
const provider = getEthersProvider(API_URL);

//Uniswap Router Contract
const routerContract = getRouterContract(provider, susiswapAddress);
startWalletMonitor(provider, routerContract);

// doTest();

//Set Configuration
// setConfig();
addNewRouter();
