const mongoose = require("mongoose");
const { Schema } = mongoose;

const TokenSchema = new Schema({
  address: String,
  name: String,
  decimal: Number,
  symbol: String,
  logoURI: String,
  chain: String,
  network: String,
  amount: String,
});

const TransactionSchema = new Schema({
  hash: String,
  success: Boolean,
  tokenAddress: String,
  date: { type: Date, default: Date.now },
  value: String,
  sender: String,
  receiver: String,
  transactionType: String,
});

const ConfigurationSchema = new Schema({
  maximumWeth: String,
  minimumWeth: String,
  amountPercentage: String,
  ourWallet: String,
  tokens: [String],
  wallets: [String],
  untrackedTokens: [String],
});

const RouterSchema = new Schema(
  {
    routerContract: String,
    routerName: String,
    wethAddress: String,
    factoryAddress: String,
    network: String,
    chainName: String,
    rpc: String,
  },
  {
    statics: {
      findByNetwork(network) {
        return this.find({ network: network });
      },
      findByRouterContract(router) {
        return this.find({ routerContract: router });
      },
    },
  }
);

const TokenBundleSchema = new Schema(
  {
    wallet: String,
    address: String,
    name: String,
    decimal: Number,
    symbol: String,
    logoURI: String,
    chain: String,
    network: String,
    amount: String,
  },
  {
    statics: {
      findByWallet(wallet) {
        return this.find({ wallet: wallet });
      },
    },
  }
);

module.exports = {
  TokenSchema,
  TransactionSchema,
  ConfigurationSchema,
  TokenBundleSchema,
  RouterSchema,
};
