require("dotenv").config();
const ethers = require("ethers");

let provider = null;
let precision = ethers.BigNumber.from("10000");

const getEthersProvider = (API_URL) => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(API_URL);
  }

  return provider;
};

const getCurrentNonce = async (provider, userAddress) => {
  let nonce = await provider.getTransactionCount(userAddress);
  return nonce;
};

module.exports = {
  getEthersProvider,
  getCurrentNonce,
  precision,
};
