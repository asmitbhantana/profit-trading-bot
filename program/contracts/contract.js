/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/
require('dotenv').config();
const { ethers, BigNumber, Contract } = require('ethers');
const { susiswapABI, susiswapAddress } = require('../contracts/const');
const { erc20Abi } = require('./const');

/*
- Task
- Sell transaction
- Buy transaction
*/

let routerContract = null;

SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;

const getRouterContract = (provider, routerAddres) => {
  if (!routerContract) {
    const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);
    routerContract = new ethers.Contract(routerAddres, susiswapABI, signer);
  }

  return routerContract;
};

const getERC20Contract = (provider, tokenAddress) => {
  const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);
  return new ethers.Contract(tokenAddress, erc20Abi, signer);
};

module.exports = {
  getRouterContract: getRouterContract,
  getERC20Contract: getERC20Contract,
};
