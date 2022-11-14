const mongoose = require('mongoose');
 const { Schema } = mongoose;

const TokenSchema = new Schema({
  _id: String,
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
  trackingWallet: String,
  tokens: [String],
  wallets: [String],
  untrackedTokens: [String],
});

const TokenBundleSchema = Schema(
  {
    tokens: [TokenSchema],
  },
  {
    statics: {
      findByWallet(wallet) {
        return this.find({ _id: wallet });
      },
    },
  }
);

module.exports = {
  TokenSchema: TokenSchema,
  TransactionSchema: TransactionSchema,
  ConfigurationSchema: ConfigurationSchema,
  TokenBundleSchema: TokenBundleSchema,
};
