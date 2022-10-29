const { getEthersProvider } = require("./utils");

OPTIONS = {
  headers: {
    "x-qn-api-version": "1",
  },
};

const getWalletERC20List = async (user_wallet) => {
  const ethersProvider = getEthersProvider();
  ethersProvider.connection.headers = OPTIONS.headers;
  const tokens = await ethersProvider.send("qn_getWalletTokenBalance", {
    wallet: user_wallet,
  });
  return tokens;
};

module.exports = {
  getWalletERC20List: getWalletERC20List,
};
