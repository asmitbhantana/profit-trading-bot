require("dotenv").config();
const ethers = require("ethers");

let provider = null;

const getEthersProvider = () => {
  if (!provider) {
    // provider = new ethers.providers.JsonRpcProvider(
    //   process.env.QUICKNODE_API_GORELI
    // );
    provider = new ethers.providers.JsonRpcProvider(
      process.env.QUICKNODE_API_MAINNET
    );
  }

  return provider;
};

module.exports = {
  getEthersProvider: getEthersProvider,
};
