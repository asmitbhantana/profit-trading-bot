const { TokenBundle } = require("../database/model");
const { getWalletERC20List } = require("./wallet");

const performWalletScan = async (chains, wallet) => {
  //token lists
  const tokens = await getWalletERC20List(chains, wallet);

  return tokens;
};

module.exports = {
  performWalletScan: performWalletScan,
};
