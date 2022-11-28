require("dotenv").config();
const { getEthersProvider } = require("../utils/utils");

OPTIONS = {
  headers: {
    "x-qn-api-version": "1",
  },
};

const getWalletERC20List = async (provider, user_wallet, tokens) => {
  ethersProvider.connection.headers = OPTIONS.headers;
  const walletTokens = await ethersProvider.send("qn_getWalletTokenBalance", {
    wallet: user_wallet,
    // contracts: tokens,
  });

  return walletTokens;
};

module.exports = {
  getWalletERC20List: getWalletERC20List,
};
