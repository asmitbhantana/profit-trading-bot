const Moralis = require("moralis").default;

const getWalletERC20List = async (chains, user_wallet) => {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address: user_wallet,
    chain: chains,
  });

  return response.data;
};

module.exports = {
  getWalletERC20List: getWalletERC20List,
};
