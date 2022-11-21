require('dotenv').config();
const ethers = require('ethers');

let provider = null;
let SEED_PHRASE = process.env.OWNER_WALLET_SEED_PHRASE;

const getEthersProvider = (API_URL) => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(API_URL);
  }

  return provider;
};

module.exports = {
  getEthersProvider: getEthersProvider,
};
