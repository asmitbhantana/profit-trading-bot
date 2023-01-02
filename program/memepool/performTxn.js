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
const {
  createSellExactTokens,
  createBuyWithExactTokens,
  createBuyExactTokens,
  executeTransactions,
} = require("../contracts/v3poolAction");

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

const performBuySaleTransactionV3 = async (
  routerContract,
  subCalls,
  wethAddress,
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

  let doneTransaction = new TransactionDone({
    network: metadata.network,
    from: metadata.from,
    to: metadata.to,
    value: metadata.value,
    originalGasLimit: metadata.gasLimit,
    gasLimit: maxGasLimit,
    methodName: metadata.methodName,
    params: JSON.stringify(subCalls),
  });

  doneTransaction.save();

  const encodedDatas = [];
  let transactionResult;

  subCalls.forEach(async (call) => {
    const callData = call.data;

    let amountOutMin = callData.params.amountOutMin;
    let amountIn = callData.params.amountIn;
    let amountOut = callData.params.amountOut;
    let amountInMaximum = callData.params.amountInMax;
    let path = [];

    let amountsTransacted = [];
    let tokensTransacted = [];

    switch (callData.methodName) {
      case "swapExactTokensForTokens":
        path = callData.params.path;
        if (path[path.length - 1] == wethAddress) {
          let swapEncode = await createSellExactTokens(
            routerContract,
            path,
            currentConfiguration.ourWallet,
            amountIn,
            amountOutMin
          );
          tokensTransacted.push(path[0]);
          amountsTransacted.push(amountIn);
          encodedDatas.push(swapEncode);
        } else {
          //exact = true
          let swapEncode = await createBuyWithExactTokens(
            routerContract,
            path,
            currentConfiguration.ourWallet,
            amountIn,
            amountOutMin
          );
          tokensTransacted.push(path[path.length - 1]);
          amountsTransacted.push(amountIn);
          encodedDatas.push(swapEncode);
        }

        break;
      case "swapTokensForExactTokens":
        path = callData.params.path;
        if (path[path.length - 1] == wethAddress) {
          let swapEncode = await createSellExactTokens(
            routerContract,
            path,
            currentConfiguration.ourWallet,
            amountIn,
            amountOutMin
          );
          tokensTransacted.push(path[0]);
          amountsTransacted.push(amountIn);
          encodedDatas.push(swapEncode);
        } else {
          //exact = false
          let swapEncode = await createBuyExactTokens(
            routerContract,
            path,
            currentConfiguration.ourWallet,
            amountOut,
            amountInMaximum
          );
          encodedDatas.push(swapEncode);
          amountsTransacted.push(amountOut);
          tokensTransacted.push(path[path.length - 1]);
        }

        break;
    }
  });
  transactionResult = await executeTransactions(
    routerContract,
    encodedDatas,
    param
  );

  console.log("Transaction Result is", transactionResult);
  if (transactionResult.state) {
    amountsTransacted.forEach(async (amountTransacted, index) => {
      //update user balance on the database
      const ourBalance = await TokenBundle({
        wallet: config.ourWallet,
        tokenAddress: tokensTransacted[index],
      });
      const ourBalanceNow = BigNumber.from(ourBalance.balance);
      let newBalance;
      if (isBuy) {
        newBalance = ourBalanceNow.add(amountTransacted);
      } else {
        newBalance = ourBalanceNow.sub(amountTransacted);
      }
      updateTokenBalance(
        config.ourWallet,
        tokensTransacted,
        newBalance.toString()
      );
    });
  }
};

module.exports = {
  performBuySaleTransaction,
  performBuySaleTransactionV3,
};
