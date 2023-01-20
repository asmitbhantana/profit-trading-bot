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

const { BigNumber } = require('ethers');
const {
  Configuration,
  TokenBundle,
  Router,
  TransactionPool,
  Token,
} = require('./model');
const { RouterSchema } = require('./schema');

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
  console.log('token updated', tokenToUpdate);
  return tokenToUpdate;
};

const updateChangedTokenBalance = async function (
  wallet,
  token,
  changedBalance,
  isBuy
) {
  let currentBalanceAmount = await TokenBundle.find({
    wallet: wallet,
    tokenAddress: token,
  }).exec();

  if (currentBalanceAmount.length > 0) {
    currentBalanceAmount = BigNumber.from(currentBalanceAmount[0].balance);
    if (isBuy)
      currentBalanceAmount = currentBalanceAmount.add(
        BigNumber.from(changedBalance)
      );
    else
      currentBalanceAmount = currentBalanceAmount.sub(
        BigNumber.from(changedBalance)
      );

    const newBalance = updateTokenBalance(
      wallet,
      token,
      currentBalanceAmount.toString()
    );
  } else {
    if (isBuy) {
      const newBalance = TokenBundle({
        wallet: wallet,
        tokenAddress: token,
        balance: changedBalance,
      });
      newBalance.save();
    }
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

const getAllWalletBalance = async (token_address, excludeWallet) => {
  const allWalletBalance = await TokenBundle.find({
    tokenAddress: token_address,
  }).exec();
  let totalBalanceNow = BigNumber.from('0');

  allWalletBalance.forEach((balance) => {
    if (Array.from(balance).length) {
      Array.from(balance).forEach((bundle) => {
        if (bundle.wallet != excludeWallet)
          totalBalanceNow = totalBalanceNow.add(BigNumber.from(bundle.balance));
      });
    } else {
      if (balance.wallet != excludeWallet)
        totalBalanceNow = totalBalanceNow.add(BigNumber.from(balance.balance));
    }
  });

  return totalBalanceNow;
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
};
