/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/
require('dotenv').config();
const { ethers, BigNumber, Contract } = require('ethers');
const { getEthersProvider } = require('../utils/utils');
const { susiswapABI, susiswapAddress } = require('../contracts/const');
const { erc20Abi } = require('./const');

const SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;
const URL = process.env.QUICKNODE_API_MAINNET;
// const URL = process.env.QUICKNODE_API_GOERLI;

const provider = getEthersProvider(URL);

const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);

/*
- Task
- Sell transaction
- Buy transaction
*/

let routerContract = null;

const getRouterContract = (routerAddres) => {
  if (!routerContract) {
    routerContract = new ethers.Contract(routerAddres, susiswapABI, signer);
  }

  return routerContract;
};

const getERC20Contract = (tokenAddress) => {
  return new ethers.Contract(tokenAddress, erc20Abi, signer);
};

module.exports = {
  getRouterContract: getRouterContract,
  getERC20Contract: getERC20Contract,
};
