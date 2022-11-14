require('dotenv').config();
const { startWalletMonitor } = require('./monitor/monitor');

//connect to the database
require('./database/connection');

const { getEthersProvider } = require('./utils/utils');
const { getRouterContract } = require('./contracts/contract');
const { susiswapAddress } = require('./contracts/const');

//API URL
const API_URL = process.env.QUICKNODE_API_MAINNET;

//Provider
const provider = getEthersProvider(API_URL);

//SUSI Router Contract
const routerContract = getRouterContract(provider, susiswapAddress);
startWalletMonitor(provider, routerContract, tokenContract);
