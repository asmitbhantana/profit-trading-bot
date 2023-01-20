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
  isConfirmedTransaction,
} = require("../database/action");
const { Token } = require("../database/model");

const performBuySaleTransaction = async (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountToBuy,
  config,
  isBuy,
  isV3,
  isMatic,

  //optional params
  { targetWallet, tokenAddress, previousBalance, newBalance }
) => {
  //prepare data
  let slippageData = await Token.findOne({}).exec();

  let feeData = await provider.getFeeData();

  let param = {};

  if (isMatic) {
    param = {
      maxFeePerGas: ethers.utils.parseEther("0.00000025"),
      maxPriorityFeePerGas: ethers.utils.parseEther("0.00000015"),

      gasLimit: BigNumber.from(config.maxGasLimit * 2),
    };
  } else {
    param = {
      maxFeePerGas: feeData["maxFeePerGas"].add(
        BigNumber.from(config.maxPriorityFee)
      ),
      maxPriorityFeePerGas: BigNumber.from(config.maxPriorityFee),
      gasLimit: BigNumber.from(config.maxGasLimit),
    };
  }

  let [buyResult, amountIn] = [0, 0];

  //check pool if the transaction is already on pool
  const isInPool = await isInPoolTransaction(
    targetWallet,
    tokenAddress,
    previousBalance,
    newBalance
  );

  if (isInPool) {
    const isConfirmed = await isConfirmedTransaction(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance
    );

    return { status: isConfirmed ? "confirmed" : "pending", amount: 0 };
  }

  const newTx = await addPoolTransaction(
    buyResult.txHash,
    targetWallet,
    tokenAddress,
    previousBalance,
    newBalance
  );

  if (isBuy) {
    const buyResultData = await performBuyTransaction(
      contract,
      sellingToken,
      buyingToken,
      amountToBuy,
      config.ourWallet,
      isV3,

      param,
      slippageData
    );

    buyResult = buyResultData;
  } else {
    const sellResultData = await performSellTransaction(
      contract,
      sellingToken,
      buyingToken,
      amountToBuy,
      config.ourWallet,
      isV3,

      param,
      slippageData
    );

    buyResult = sellResultData;
  }

  if (buyResult.status) {
    await updateConfirmation(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance,
      false
    );
  } else {
    await updateConfirmation(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance,
      true
    );
  }
  return { ...buyResult };
};

const performApprovalTransaction = async (provider, tokenAddress, spender) => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  let feeData = await provider.getFeeData();

  let param = {
    maxFeePerGas: feeData["maxFeePerGas"].add(BigNumber.from("1000000000")),
  };

  console.log("params", param.maxFeePerGas.toString());

  const tokenApprovalResult = await performTokenApprovalTransaction(
    tokenContract,
    spender,

    { ...param }
  );

  return tokenApprovalResult;
};

module.exports = {
  performBuySaleTransaction,
  performApprovalTransaction,
};
