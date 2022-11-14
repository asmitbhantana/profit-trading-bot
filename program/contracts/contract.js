/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/

const { ethers, BigNumber, Contract } = require('ethers');
const { getEthersProvider } = require('../utils/utils');
const { susiswapABI, susiswapAddress } = require('../utils/utils');
const { erc20Abi } = require('./const');

const SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;
const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);

/*
- Task
- Sell transaction
- Buy transaction
*/

let routerContract = null;

const getRouterContract = (routerAddres) => {
  if (!router) {
    routerContract = new ethers.Contract(routerAddres, susiswapABI, signer);
  }

  return routerContract;
};

const getERC20Contract = (tokenAddress) => {
  return new ethers.Contract(tokenAddress, erc20Abi, signer);
};

module.exports = {
  getRouterContract: getRouterContract,
  getERC20Contract: getERC20Contract
};
