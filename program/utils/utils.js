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

module.exports = {
  getEthersProvider,
  precision,
};
