require('dotenv').config();
const { startWalletMonitor } = require('./monitor/monitor');

//connect to the database
require('./database/connection');

const { getEthersProvider } = require('./utils/utils');
const { getRouterContract } = require('./contracts/contract');
const { susiswapAddress } = require('./contracts/const');
const { setConfig } = require('./setting/setting');
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require('./monitor/performTxn');
const { BigNumber } = require('ethers');

// // API URL
// const API_URL = process.env.QUICKNODE_API_MAINNET;

// //Provider
// const provider = getEthersProvider(API_URL);

// //Uniswap Router Contract
// const routerContract = getRouterContract(provider, susiswapAddress);
// startWalletMonitor(provider, routerContract);

//Test
const doTest = async () => {
  const API_TEST_URL = process.env.QUICKNODE_API_GOERLI;
  const testProvider = getEthersProvider(API_TEST_URL);
  const testRouterContract = getRouterContract(testProvider, susiswapAddress);

  const tusd = '0x60450439A3d91958E9Dae0918FC4e0d59a77f896';
  const abc = '0x733dFB5f428c517bF80A72ACeC969B58b857AeF0';
  const amountToBuy = BigNumber.from('1000000000000');
  const wallet = '0xD114dDe767a972Eb3665840b14F78FaEE3943E80';
  performApprovalTransaction(
    testProvider,
    tusd,
    testRouterContract.address,
    amountToBuy,
    wallet
  );
  performBuySaleTransaction(
    testProvider,
    testRouterContract,
    tusd,
    abc,
    amountToBuy,
    wallet
  );
};

doTest();

//Set Configuration
// setConfig();
