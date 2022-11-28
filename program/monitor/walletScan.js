const { TokenBundle } = require("../database/model");
const { getWalletERC20List } = require("./wallet");

const performWalletScan = async (provider, wallet, parsedTokens) => {
  //token lists
  const tokens = await getWalletERC20List(provider, wallet, parsedTokens);
  return tokens.assets;
};

module.exports = {
  performWalletScan: performWalletScan,
};
