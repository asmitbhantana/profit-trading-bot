const { getAddress } = require("ethers/lib/utils");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// const TransactionSchema = new Schema({
//   hash: String,
//   success: Boolean,
//   tokenAddress: { type: String, get: getAddress, set: getAddress },
//   date: { type: Date, default: Date.now },
//   value: String,
//   sender: String,
//   receiver: String,
//   transactionType: String,
//   transactionHash: String,
//   trackTransactionHash: String,
// });

const TransactionsDoneSchema = new Schema({
  //Target
  targetTimeStamp: String,
  targetHash: String,
  targetWallet: { type: String, get: getAddress, set: getAddress },
  targetTransactionResult: String,
  targetEthAmount: String,
  targetFeeAmount: String,
  targetMaxGwei: String,
  targetMaxPriorityGwei: String,
  targetGasLimit: String,
  targetTokenAmount: String,

  //common
  tokenContract: { type: String, get: getAddress, set: getAddress }, //
  transactionType: String,
  flowType: String,

  //Our
  ourTimeStamp: String,
  ourHash: String,
  ourTransactionResult: String,
  ourGasUsed: String,
  ourEthAmount: String,
  ourFeeAmount: String,
  ourMaxGwei: String,
  ourMaxPriorityGwei: String,
  ourGasLimit: String,
  ourTokenAmount: String,
});

const ConfigurationSchema = new Schema({
  maximumWeth: String, //0.12 in weth string
  minimumWeth: String, //0.001 in weth string
  amountPercentage: String, //200 for 20%
  ourWallet: String, //wallet address on string
  wallets: [String], //wallets addresses on array [string]
  untrackedTokens: [String], //untracked tokens strings
  maxFeePerGasIncrease: String, // percentage 1000%
  maxPriorityFeePerGasIncrease: String, // percentage 2000%
  maximumFeePerGas: String, // maximum gas in wei,
  networkFeeIncreaseTokenTracking: String, //120% of total fee by provider
});

const RouterSchema = new Schema({
  routerContract: { type: String, get: getAddress, set: getAddress },
  routerName: String,
  wethAddress: { type: String, get: getAddress, set: getAddress },
  factoryAddress: { type: String, get: getAddress, set: getAddress },
  network: String,
  chainName: String,
  rpc: String,
  isV3: Boolean, // false For V2 and true for V3
  isUniversalRouter: Boolean, // true for universal router and false for non-universal router
});

const TokenBundleSchema = new Schema({
  wallet: String,
  tokenAddress: { type: String, get: getAddress, set: getAddress },
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
  tokenAddress: { type: String, get: getAddress, set: getAddress },
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

// const TransactionsDoneSchema = new Schema({
//   to: String,
//   success: Boolean, // txn result
//   ourGwei: String, //our txn gwei
//   targetGwei: String, //target txn gwei
//   ourTxnHash: String,
//   createdAt: { type: Date, default: Date.now },
//   transactionFlow: String,
//   data: String,
//   feePaid: String,
// });

module.exports = {
  ConfigurationSchema,
  TokenBundleSchema,
  RouterSchema,
  TransactionPoolSchema,
  TokenSchema,
  TransactionsDoneSchema,
};
