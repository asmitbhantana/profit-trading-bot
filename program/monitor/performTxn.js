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
  const metadata = config;

  let feeData = await provider.getFeeData();

  let maxFeePerGas = feeData["maxFeePerGas"];

  console.log("maxFeePerGas: " + maxFeePerGas);
  console.log("performing " + maxFeePerGas);
  let param = {
    maxFeePerGas: Math.floor(
      (Number(maxFeePerGas) * Number(config.networkFeeIncreaseTokenTracking)) /
        100
    ),
    maxPriorityFeePerGas: Math.floor(
      (Number(maxFeePerGas) * Number(config.networkFeeIncreaseTokenTracking)) /
        100
    ),
    gasLimit: "431109",
  };

  let [buyResult, amountIn] = [0, 0];

  let doneTransaction = new TransactionDone({
    to: "",
    success: false,
    ourGwei: param.maxFeePerGas.toString(),
    targetGwei: "",
    ourTxnHash: "",
    createdAt: new Date(),
    transactionFlow: "Token Tracking",
    data: JSON.stringify({
      "selling Token": sellingToken,
      "buying Token": buyingToken,
      amount: amountToBuy,
    }),
    feePaid: "",
  });
  doneTransaction.save();

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
      false,
      buyResult.transactionHash
    );
    await doneTransaction.updateOne({
      ourTxn: buyResult.transactionHash,
      success: true,
    });
  } else {
    await updateConfirmation(
      targetWallet,
      tokenAddress,
      previousBalance,
      newBalance,
      true,
      buyResult.transactionHash
    );
    await doneTransaction.updateOne({
      ourTxn: buyResult.transactionHash,
      success: false,
    });
  }
  return { ...buyResult };
};

const performApprovalTransaction = async (
  provider,
  tokenAddress,
  spender,
  config
) => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  let feeData = await provider.getFeeData();
  let maxFeePerGas = feeData["maxFeePerGas"];
  let nonce = getCurrentNonce(provider, tokenContract.signer.getAddress());
  console.log("nonce is ", nonce.toString());
  let param = {
    maxFeePerGas: Math.floor(
      (Number(maxFeePerGas) * Number(config.networkFeeIncreaseTokenTracking)) /
        100
    ),
    gasLimit: "231109",
    nonce: nonce,
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
