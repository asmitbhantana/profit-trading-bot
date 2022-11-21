require('dotenv').config();
const { startWalletMonitor } = require('./monitor/monitor');

//connect to the database
require('./database/connection');

const { getEthersProvider } = require('./utils/utils');
const { getRouterContract } = require('./contracts/contract');
const { susiswapAddress } = require('./contracts/const');
const { setConfig } = require('./setting/setting');
const { performBuySaleTransaction } = require('./monitor/performTxn');

// API URL
// const API_URL = process.env.QUICKNODE_API_MAINNET;

//Provider
// const provider = getEthersProvider(API_URL);

//Uniswap Router Contract
// const routerContract = getRouterContract(provider, susiswapAddress);
// startWalletMonitor(provider, routerContract);

//Test
const API_TEST_URL = process.env.QUICKNODE_API_GOERLI;
const testProvider = getEthersProvider(API_TEST_URL);
const testRouterContract = getRouterContract(testProvider, susiswapAddress);
performBuySaleTransaction(testProvider, testRouterContract);

// setConfig();
