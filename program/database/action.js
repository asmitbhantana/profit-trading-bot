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

const { BigNumber } = require("ethers");
const {
  Configuration,
  TokenBundle,
  Router,
  TransactionPool,
  Token,
  TransactionDone,
  Nonce,
} = require("./model");
const { getWalletBalance } = require("../monitor/wallet");

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

const createUpdateSlippageFee = async (slippagePercentage, feePercentage) => {
  const newUpdatedSlippage = await Token.findOneAndUpdate(
    {},
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
  console.log("token updated", tokenToUpdate);
  return tokenToUpdate;
};

const updateChangedTokenBalance = async function (wallet, token, provider) {
  let currentBalanceAmount = await TokenBundle.find({
    wallet: wallet,
    tokenAddress: token,
  }).exec();

  let newBalanceAmount = await getWalletBalance(token, wallet, provider);

  if (currentBalanceAmount.length > 0) {
    const newBalance = updateTokenBalance(
      wallet,
      token,
      newBalanceAmount.toString()
    );
  } else {
    const newBalance = TokenBundle({
      wallet: wallet,
      tokenAddress: token,
      balance: newBalanceAmount,
    });
    newBalance.save();
  }
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
  if (currentPendingTransaction) {
    if (currentPendingTransaction.confirmed) {
      return !currentPendingTransaction.failed;
    }
    return true;
  } else {
    return false;
  }
};

const isConfirmedTransaction = async (
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
  if (currentPendingTransaction) {
    return currentPendingTransaction.confirmed;
  }
  return false;
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

  failed,
  txnHash
) => {
  let updatedPendingTransaction = TransactionPool.findOneAndUpdate(
    {
      targetWallet: targetWallet,
      tokenAddress: tokenAddress,
      previousBalance: previousBalance,
      newBalance: newBalance,
    },
    { confirmed: true, failed: failed, txnHash: txnHash }
  ).exec();
  return updatedPendingTransaction;
};

const getAllWalletBalance = async (token_address, excludeWallet) => {
  const alreadyTrackedWallet = [];
  const allWalletBalance = await TokenBundle.find({
    tokenAddress: token_address,
  }).exec();
  let totalBalanceNow = BigNumber.from("0");

  allWalletBalance.forEach((balance) => {
    if (Array.from(balance).length) {
      Array.from(balance).forEach((bundle) => {
        if (
          bundle.wallet != excludeWallet &&
          !alreadyTrackedWallet.includes(bundle.wallet)
        ) {
          totalBalanceNow = totalBalanceNow.add(BigNumber.from(bundle.balance));
          alreadyTrackedWallet.push(bundle.wallet);
        }
      });
    } else {
      if (balance.wallet != excludeWallet)
        totalBalanceNow = totalBalanceNow.add(BigNumber.from(balance.balance));
    }
  });

  return totalBalanceNow;
};

const createNewTransaction = async (targetTxnHash, data) => {
  let doneTransaction = new TransactionDone({
    targetHash: targetTxnHash,
    ...data,
  });

  doneTransaction.save();

  return doneTransaction;
};

const havePrevTransaction = async (targetTxnHash) => {
  let txn = await TransactionDone.find({ targetHash: targetTxnHash });
  console.log("txn", txn);
  if (txn.length > 0) return false;
  else return true;
};

const updateTransaction = async (targetTxnHash, updatedData) => {
  let currentTransaction = TransactionDone.findOneAndUpdate(
    { targetHash: targetTxnHash },
    { ...updatedData },
    { new: false, upsert: true }
  ).exec();

  return currentTransaction;
};

const updateOurTransaction = async (ourTxnHash, updatedData) => {
  let currentTransaction = TransactionDone.findOneAndUpdate(
    { ourHash: ourTxnHash },
    { ...updatedData },
    { new: false, upsert: true }
  ).exec();

  return currentTransaction;
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
  getAllWalletBalance,
  updateChangedTokenBalance,
  isConfirmedTransaction,
  havePrevTransaction,
  createNewTransaction,
  updateTransaction,
  updateOurTransaction,
};
