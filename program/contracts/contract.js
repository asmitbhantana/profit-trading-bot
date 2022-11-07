/*
- Task
- prepare contract
- prepare & store web3 providers 
- signer
*/

require("dotenv").config();
const { ethers, BigNumber, Contract } = require("ethers");
const { getEthersProvider } = require("../utils/utils");
const { susiswapABI, susiswapAddress } = require("../utils/utils");

const SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;

/*
- Task
- Sell transaction
- Buy transaction
*/
const provider = getEthersProvider();
const signer = ethers.Wallet.fromMnemonic(SEED_PHRASE).connect(provider);

let routerContract = null;

const getRouterContract = (routerAddres) => {
  if (!router) {
    routerContract = new ethers.Contract(susiswapAddress, susiswapABI, signer);
  }

  return routerContract;
};

module.exports = {
  routerContract: routerContract,
};
