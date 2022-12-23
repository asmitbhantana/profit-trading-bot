const { BigNumber, ethers } = require("ethers");
const { isBytes } = require("ethers/lib/utils");
const {
  performBuyTransaction,
  performSellTransaction,
  performTokenApprovalTransaction,
} = require("../contracts/trackAction");
const { getERC20Contract } = require("../contracts/contract");
const {
  isInPoolTransaction,
  addPoolTransaction,
  updateConfirmation,
} = require("../database/action");
const { Token } = require("../database/model");

const performBuySaleTransaction = async (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountToBuy,
  wallet,
  isBuy,

  isFrontRun,
  maxGasLimit,
  maxPriorityFee,

  //optional params
  { targetWallet, tokenAddress, previousBalance, newBalance }
) => {
  //prepare data
  let slippageData = await Token.findOne({}).exec();

  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    maxFeePerGas: feeData["maxFeePerGas"],
    maxPriorityFeePerGas: isFrontRun
      ? maxPriorityFee
      : ethers.utils.parseUnits("2", "gwei"),
    gasLimit: maxGasLimit,
  };

  let [buyResult, amountIn] = [0, 0];

  if (isBuy) {
    const buyResultData = await performBuyTransaction(
      contract,
      sellingToken,
      buyingToken,
      amountToBuy,
      wallet,

      param,
      slippageData
    );

    [buyResult, amountIn] = buyResultData;
  } else {
    const sellResultData = await performSellTransaction(
      contract,
      sellingToken,
      buyingToken,
      amountToBuy,
      wallet,

      param,
      slippageData
    );

    [buyResult, amountIn] = sellResultData;
  }

  //check pool if the transaction is already on pool
  const isInPool = await isInPoolTransaction(
    targetWallet,
    tokenAddress,
    previousBalance,
    newBalance
  );

  if (isInPool) return { status: "pending", amount: amountIn };
  else {
    const newTx = await addPoolTransaction(
      buyResult.txHash,
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance
    );
  }
  let buyTransactionResult = await buyResult.wait();
  console.log("Transactions Result", buyTransactionResult);

  if (buyTransactionResult.status) {
    updateConfirmation(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance,
      false
    );
  } else {
    updateConfirmation(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance,
      true
    );
  }
  return { ...buyTransactionResult, amount: amountIn };
};

const performApprovalTransaction = async (
  provider,
  tokenAddress,
  spender,
  amountToBuy
) => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    maxFeePerGas: feeData["maxFeePerGas"],
    gasLimit: maxPriorityFee,
  };

  const tokenApprovalResult = await performTokenApprovalTransaction(
    tokenContract,
    spender,
    amountToBuy,

    param
  );

  return tokenApprovalResult;
};

module.exports = {
  performBuySaleTransaction,
  performApprovalTransaction,
};
