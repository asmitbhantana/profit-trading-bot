const { TokenBundle } = require('../database/model');
const { getWalletERC20List } = require('./wallet');

const performWalletScan = async (wallet, parsedTokens) => {
  //token lists
  const tokens = await getWalletERC20List(wallet, parsedTokens);
  return tokens.assets;
};

module.exports = {
  performWalletScan: performWalletScan,
};
