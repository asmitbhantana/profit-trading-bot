//gas limit check,
//priority fee set, frontrun
//add in the database
//update database with the amount of token bought sold

const { BigNumber } = require("ethers");
const {
  sellExactTokens,
  buyExactTokens,
  buyWithExactTokens,
  sellForExactTokens,
} = require("../contracts/poolAction");
const { updateTokenBalance } = require("../database/action");
const { TransactionDone, TokenBundle } = require("../database/model");

const performBuySaleTransaction = async (
  provider,
  contract,
  sellingToken,
  buyingToken,
  buyingAmount,
  sellingAmount,
  isBuy,
  isExact,
  config,
  arguments,
  metadata
) => {
  let maxGasLimit = arguments.gasLimit;
  let maxPriorityFee = config.maxPriorityFee;
  let feeData = await provider.getFeeData();

  if (maxGasLimit > config.maxGasLimit) {
    maxGasLimit = config.maxGasLimit;
  }
  let param = {
    maxFeePerGas: Number(feeData["maxFeePerGas"]) + Number(maxPriorityFee),
    maxPriorityFeePerGas: maxPriorityFee,
  };

  console.log("Fee Param", param);
  console.log("Performing BuySale Transactions with Arg", arguments);
  console.log("Performing BuySale Transactions with Metadata", metadata);

  let doneTransaction = new TransactionDone({
    network: metadata.network,
    from: metadata.from,
    to: metadata.to,
    value: metadata.value,
    originalGasLimit: metadata.gasLimit,
    gasLimit: maxGasLimit,
    methodName: metadata.methodName,
    params: JSON.stringify(arguments),
  });

  doneTransaction.save();
  let transactionResult;
  let amountTransacted;
  let tokenTransacted;

  if (isBuy) {
    amountTransacted = buyingAmount;
    tokenTransacted = buyingToken;

    if (isExact) {
      transactionResult = await buyWithExactTokens(
        contract,
        sellingToken,
        buyingToken,
        sellingAmount,
        buyingAmount,
        config.ourWallet,
        param
      );
    } else {
      transactionResult = await buyExactTokens(
        contract,
        sellingToken,
        buyingToken,
        buyingAmount,
        sellingAmount,
        config.ourWallet,
        param
      );
    }
  } else {
    amountTransacted = sellingAmount;
    tokenTransacted = sellingToken;
    if (isExact) {
      transactionResult = await sellForExactTokens(
        contract,
        sellingToken,
        buyingToken,
        buyingAmount,
        sellingAmount,
        config.ourWallet,
        param
      );
    } else {
      transactionResult = await sellExactTokens(
        contract,
        sellingToken,
        buyingToken,
        buyingAmount,
        sellingAmount,
        config.ourWallet,
        param
      );
    }
  }
  console.log("Transaction Result is", transactionResult);
  if (transactionResult.state) {
    //update user balance on the database
    const ourBalance = await TokenBundle({
      wallet: config.ourWallet,
      tokenAddress: tokenTransacted,
    });
    const ourBalanceNow = BigNumber.from(ourBalance.balance);
    let newBalance;
    if (isBuy) {
      newBalance = ourBalanceNow.add(amountTransacted);
    } else {
      newBalance = ourBalanceNow.sub(amountTransacted);
    }
    await updateTokenBalance(
      config.ourWallet,
      tokenTransacted,
      newBalance.toString()
    );
  }
};

module.exports = {
  performBuySaleTransaction,
};
