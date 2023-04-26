const { TokenBundle } = require("../database/model");
const { getWalletERC20List } = require("./wallet");

const performWalletScan = async (chains, wallet, token) => {
  //token lists
  const tokens = await getWalletERC20List(chains, wallet, token);

  return tokens;
};

module.exports = {
  performWalletScan: performWalletScan,
};
