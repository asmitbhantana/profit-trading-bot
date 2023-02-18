const Moralis = require("moralis").default;
const { getERC20Contract } = require("../contracts/contract");

const getWalletERC20List = async (chains, user_wallet) => {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address: user_wallet,
    chain: chains,
  });
  return response.data;
};

const getWalletBalance = async (token, wallet, provider) => {
  const tokenContract = getERC20Contract(provider, token);
  const balance = await tokenContract.balanceOf(wallet);
  console.log("balance", token, "of", wallet, "is", balance);
  return balance;
};

module.exports = {
  getWalletERC20List,
  getWalletBalance,
};
