require("dotenv").config();
const { startWalletMonitor } = require("./monitor/monitor");
const { EvmChain } = require("@moralisweb3/evm-utils");

//connect to the database
require("./database/connection");

const { getEthersProvider } = require("./utils/utils");
const { getRouterContract } = require("./contracts/contract");
const { susiswapAddress } = require("./contracts/const");
const { setConfig, addRouter, addNewRouter } = require("./setting/setting");

const { BigNumber } = require("ethers");

//Set Configuration
// setConfig();
// addNewRouter();

// API URL
const API_URL = process.env.GOERLI_RPC;

//Provider
const provider = getEthersProvider(API_URL);

//Uniswap Router Contract
const routerContract = getRouterContract(provider, susiswapAddress);
startWalletMonitor(EvmChain.GOERLI, provider, routerContract);
