const { BigNumber, ethers } = require("ethers");
const { isBytes } = require("ethers/lib/utils");
const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require("../contracts/action");
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

  //optional params
  { targetWallet, tokenAddress, previousBalance, newBalance }
) => {
  //prepare data
  let slippageData = await Token.findOne({ tokenAddress: sellingToken }).exec();

  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    maxFeePerGas: feeData["maxFeePerGas"],
    maxPriorityFeePerGas: isFrontRun
      ? ethers.utils.parseUnits("5", "gwei")
      : ethers.utils.parseUnits("2", "gwei"), //TODO: make this customizable
    gasLimit: 165123, //TODO: make this variable
  };

  //fee used = gasLimit * fee per gas = gwei
  //our limit <= fee used  => perform transaction

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
    gasLimit: 46568, //TODO: make this variable
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
