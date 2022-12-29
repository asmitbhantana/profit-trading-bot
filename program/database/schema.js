const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  maxGasLimit: String,
  maxPriorityFee: String,
});

const RouterSchema = new Schema({
  routerContract: String,
  routerName: String,
  wethAddress: String,
  factoryAddress: String,
  network: String,
  chainName: String,
  rpc: String,
  version: String, // 2 For V2 and 3 for V3
});

const TokenBundleSchema = new Schema({
  wallet: String,
  tokenAddress: String,
  name: String,
  decimal: Number,
  symbol: String,
  logoURI: String,
  chain: String,
  network: String,
  balance: String,
});

//it keep tracks of all the transactions that are on the current memepool saves their hashes
const TransactionPoolSchema = new Schema({
  targetWallet: String,
  tokenAddress: String,
  transactionHash: String,
  previousBalance: String,
  newBalance: String,
  started: Boolean,
  confirmed: Boolean,
  failed: Boolean,
});

const TokenSchema = new Schema({
  feePercentage: String, //100 = 10
  slippagePercentage: String, //101 = 10.1
});

const TransactionsDoneSchema = new Schema({
  txnHash: String,
  ourTxnHash: String,
  network: String,
  from: String,
  to: String,
  value: String,
  originalGasLimit: String,
  gasLimit: String,
  methodName: String,
  params: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  TransactionSchema,
  ConfigurationSchema,
  TokenBundleSchema,
  RouterSchema,
  TransactionPoolSchema,
  TokenSchema,
  TransactionsDoneSchema,
};
