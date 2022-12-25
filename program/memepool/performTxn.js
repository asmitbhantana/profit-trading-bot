//gas limit check,
//priority fee set, frontrun
//add in the database
//update database with the amount of token bought sold

const { BigNumber } = require("ethers");
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
  config,
  arguments,
  metadata
) => {
  let maxGasLimit = arguments.gasLimit;
  let maxPriorityFee = config.maxPriorityFee;
  let feeData = await provider.getFeeData();

  if (maxGasLimit > config.maxGasLimit) {
    maxGasLimit = maxPriorityFee;
  }
  let param = {
    maxFeePerGas: feeData["maxFeePerGas"],
    maxPriorityFeePerGas: config.maxPriorityFee,
  };

  let doneTransaction = new TransactionDone({
    network: metadata.network,
    from: metadata.from,
    to: metadata.to,
    value: metadata.value,
    originalGasLimit: metadata.gasLimit,
    gasLimit: maxGasLimit,
    methodName: metadata.methodName,
    params: arguments,
  });

  doneTransaction.save();
  let transactionResult;
  let amountTransacted;
  let tokenTransacted;

  if (isBuy) {
    amountTransacted = buyingAmount;
    tokenTransacted = buyingToken;
    transactionResult = await sellExactTokens(
      contract,
      sellingToken,
      buyingToken,
      sellingAmount,
      buyingAmount,
      config.ourWallet,
      param
    );
  } else {
    amountTransacted = sellingAmount;
    tokenTransacted = sellingToken;
    transactionResult = await buyExactTokens(
      provider,
      contract,
      sellingToken,
      buyingToken,
      sellingAmount,
      buyingAmount,
      wallet,
      params
    );
  }
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
  performBuySaleTransaction
}