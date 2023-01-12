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
const {
  updateTokenBalance,
  updateChangedTokenBalance,
  getAllWalletBalance,
} = require("../database/action");
const { TransactionDone, TokenBundle } = require("../database/model");
const {
  createSellExactTokens,
  createBuyWithExactTokens,
  createBuyExactTokens,
  executeTransactions,
  createSellForExactTokens,
} = require("../contracts/v3poolAction");
const {
  calculateBudget,
  calculateIOAmount,
  calculateSellAmount,
} = require("../budget/budget");

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
  let maxGasLimit = metadata.gasLimit;
  let maxPriorityFee = config.maxPriorityFee;
  let feeData = await provider.getFeeData();

  if (maxGasLimit > config.maxGasLimit) {
    maxGasLimit = config.maxGasLimit;
    console.log("Max gas limit exceeded", maxGasLimit);
  }

  let param = {
    maxFeePerGas: Number(feeData["maxFeePerGas"]) + Number(maxPriorityFee),
    maxPriorityFeePerGas: maxPriorityFee,
    gasLimit: maxGasLimit,
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
  if (transactionResult[0].status == 1) {
    updateChangedTokenBalance(
      config.ourWallet,
      tokenTransacted,
      amountTransacted,
      isBuy
    );
  }
};

const performBuySaleTransactionV3 = async (
  provider,
  routerContract,
  router,
  subCalls,
  config,
  arguments,
  metadata,
  isConfirmed
) => {
  let maxGasLimit = metadata.gasLimit;
  let maxPriorityFee = config.maxPriorityFee;
  let feeData = await provider.getFeeData();

  if (maxGasLimit > config.maxGasLimit) {
    maxGasLimit = config.maxGasLimit;
  }
  //TODO:: change this on production
  let param = {
    maxFeePerGas:
      Number(feeData["maxFeePerGas"]) + Number(feeData["maxFeePerGas"] * 10),
    // Number(feeData["maxFeePerGas"]) + Number(maxPriorityFee),

    // maxPriorityFeePerGas: maxPriorityFee,
    maxPriorityFeePerGas: feeData["maxFeePerGas"] * 10,
    gasLimit: maxGasLimit,
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

  let transactionResult;
  let ratio;

  let amountsTransacted = [];
  let tokensTransacted = [];
  let transactedType = [];

  console.log("in perform transaction subcalls ->", subCalls);
  console.log("in perform transaction confirmed ->", isConfirmed);
  await subCalls.forEach(async (call) => {
    console.log("in perform transaction ->", call);
    const callData = call.data;
    console.log("call data ->", callData);
    let amountOutMin = callData.params.amountOutMin;
    let amountIn = callData.params.amountIn;
    let amountOut = callData.params.amountOut;
    let amountInMaximum = callData.params.amountInMax;
    let path = [];

    let fee;
    let sqrtPriceLimit;

    console.log("method", callData.methodName);
    console.log("router", router);
    console.log("router", router.wethAddress);
    let encodedDatas;

    switch (callData.methodName) {
      case "exactInputSingle":
        path[0] = callData.params.params.tokenIn;
        path[1] = callData.params.params.tokenOut;
        fee = callData.params.params.fee;
        amountIn = callData.params.params.amountIn;
        amountOutMinimum = callData.params.params.amountOutMinimum;
        sqrtPriceLimit = callData.params.params.sqrtPriceLimitX96;

        if (path[0] == router.wethAddress) {
          //buy token

          if (isConfirmed) {
            updateChangedTokenBalance(
              metadata.from,
              path[1],
              amountOutMinimum,
              true
            );
          } else {
            //get the budget
            //perform the transactions
            [amountIn, amountOutMinimum] = calculateIOAmount(
              amountIn,
              amountOutMinimum
            );
            encodedDatas = await createBuyWithExactTokens(
              routerContract,
              path,
              fee,
              config.ourWallet,
              amountIn,
              amountOutMinimum,
              sqrtPriceLimit
            );

            console.log("received encoded datas is", encodedDatas);
            tokensTransacted.push(path[1]);
            amountsTransacted.push(amountOutMinimum);

            transactedType.push(true);
          }
        } else if (path[1] == routerContract.wethAddress) {
          //sell token
          if (isConfirmed) {
            updateChangedTokenBalance(
              metadata.from,
              metadata.path[0],
              amountIn,
              false
            );
            break;
          } else {
            const wallet0Balance = await getAllWalletBalance(
              path[0],
              config.ourWallet
            );
            let ourBalance0 = await TokenBundle.findOne({
              wallet: config.ourWallet,
              tokenAddress: path[0],
            }).exec();

            [amountIn, ratio] = await calculateSellAmount(
              wallet0Balance,
              amountIn,
              ourBalance0
            );

            amountOutMin = BigNumber.from(amountOutMin).div(ratio);

            encodedDatas = await createSellExactTokens(
              routerContract,
              path,
              config.ourWallet,
              amountIn,
              amountOutMin
            );

            tokensTransacted.push(path[0]);
            amountsTransacted.push(amountIn);
            transactedType.push(false);

            console.log("encoded datas sell", encodedDatas);
          }
        } else {
          //sell token
          const wallet0Balance = await getAllWalletBalance(
            path[0],
            config.ourWallet
          );
          let ourBalance0 = await TokenBundle.findOne({
            wallet: config.ourWallet,
            tokenAddress: path[0],
          }).exec();

          [amountIn, ratio] = await calculateSellAmount(
            wallet0Balance,
            amountIn,
            ourBalance0
          );

          amountOutMin = BigNumber.from(amountOutMin).div(ratio);

          encodedDatas = await createSellExactTokens(
            routerContract,
            path,
            fee,
            config.ourWallet,
            amountIn,
            amountOutMin,
            sqrtPriceLimit
          );

          tokensTransacted.push(path[0]);
          amountsTransacted.push(amountIn);
          transactedType.push(false);

          tokensTransacted.push(path[1]);
          amountsTransacted.push(amountOutMin);
          transactedType.push(true);

          console.log("encoded datas simple buy", encodedDatas);
        }
    }

    if (isConfirmed) return;
    console.log("encoded datas up of is confirmed", encodedDatas);

    transactionResult = await executeTransactions(
      routerContract,
      encodedDatas,
      param
    );

    console.log("Transaction Result is", transactionResult);
    if (transactionResult.status == 1) {
      amountsTransacted.forEach(async (amountTransacted, index) => {
        //update user balance on the database

        await updateChangedTokenBalance(
          config.ourWallet,
          tokensTransacted[index],
          amountTransacted,
          transactedType[index]
        );
      });
    }
  });
};

module.exports = {
  performBuySaleTransaction,
  performBuySaleTransactionV3,
};
