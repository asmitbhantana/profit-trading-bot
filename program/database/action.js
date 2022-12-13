/*
Transactions:

find all transactions
 filters:
  -sender
  -date
  -receipents
  -value
  -hash

Tokens:

  find all tokens
   filters:
   - sender
   - tokens

Configurations:
  store all the config 
  update all the config
 */

const {
  Configuration,
  TokenBundle,
  Router,
  TransactionPool,
  Token,
} = require("./model");
const { RouterSchema } = require("./schema");

const createUpdateConfig = async function (config) {
  const updatedConfig = await Configuration.findOneAndUpdate({}, config, {
    new: true,
    upsert: true,
  }).exec();

  return updatedConfig;
};

const addRouter = async function (router) {
  const newRouter = new Router(router);
  newRouter.save();

  return newRouter;
};

const createUpdateTokens = async function (wallet, token, updatedTokens) {
  const newUpdatedTokens = await TokenBundle.findOneAndUpdate(
    {
      wallet: wallet,
      tokenAddress: token,
    },
    updatedTokens,
    {
      new: false,
      upsert: true,
    }
  ).exec();

  return newUpdatedTokens;
};

const createUpdateSlippageFee = async (
  tokenAddress,
  slippagePercentage,
  feePercentage
) => {
  const newUpdatedSlippage = await Token.findOneAndUpdate(
    {
      tokenAddress: tokenAddress,
    },
    {
      slippagePercentage,
      feePercentage,
    },
    { new: false, upsert: true }
  ).exec();

  return newUpdatedSlippage;
};

const updateTokenBalance = async function (wallet, token, new_balance) {
  const tokenToUpdate = await TokenBundle.findOneAndUpdate(
    {
      wallet: wallet,
      tokenAddress: token,
    },
    { balance: new_balance }
  ).exec();

  return tokenToUpdate;
};

const isTrackingwallet = async (wallet) => {
  let currenConfiguration = await Configuration.findOne({}).exec();
  return Array.from(currenConfiguration.wallets).includes(wallet, 0);
};

const isInPoolTransaction = async (
  targetWallet,
  tokenAddress,
  previousBalance,
  newBalance
) => {
  let currentPendingTransaction = await TransactionPool.findOne({
    targetWallet: targetWallet,
    tokenAddress: tokenAddress,
    previousBalance: previousBalance,
    newBalance: newBalance,
  }).exec();
  return currentPendingTransaction ? currentPendingTransaction.started : false;
};

const addPoolTransaction = async (
  transactionHash,
  targetWallet,
  tokenAddress,
  previousBalance,
  newBalance
) => {
  const txn = new TransactionPool({
    targetWallet: targetWallet,
    tokenAddress: tokenAddress,
    transactionHash: transactionHash,
    previousBalance: previousBalance,
    newBalance: newBalance,
    started: true,
    confirmed: false,
    failed: false,
  });

  txn.save();
  return txn;
};

const updateConfirmation = async (
  targetWallet,
  tokenAddress,
  previousBalance,
  newBalance,

  failed
) => {
  let updatedPendingTransaction = TransactionPool.findOneAndUpdate(
    {
      targetWallet: targetWallet,
      tokenAddress: tokenAddress,
      previousBalance: previousBalance,
      newBalance: newBalance,
    },
    { confirmed: true, failed: failed }
  ).exec();

  return updatedPendingTransaction;
};

module.exports = {
  createUpdateTokens,
  createUpdateConfig,
  createUpdateSlippageFee,
  isTrackingwallet,
  addRouter,
  updateTokenBalance,
  isInPoolTransaction,
  addPoolTransaction,
  updateConfirmation,
  updateTokenBalance,
};
