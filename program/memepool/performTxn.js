//gas limit check,
//priority fee set, frontrun
//add in the database
//update database with the amount of token bought sold

const { BigNumber, ethers } = require("ethers");
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
const { calculateIOAmount, calculateSellAmount } = require("../budget/budget");
const { performApprovalTransaction } = require("../monitor/performTxn");

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
    maxPriorityFeePerGas: BigNumber.from(maxPriorityFee),
    gasLimit: BigNumber.from(maxGasLimit),
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
  let maxPriorityFeePerGas = config.maxPriorityFee;
  let feeData = await provider.getFeeData();

  if (maxGasLimit > config.maxGasLimit) {
    maxGasLimit = config.maxGasLimit;
  }
  let param = {};
  if (metadata.network == "matic-main") {
    param = {
      maxFeePerGas: ethers.utils.parseEther("0.00000025"),

      maxPriorityFeePerGas: ethers.utils.parseEther("0.00000015"),
      gasLimit: Number(maxGasLimit) * 2,
    };
  } else {
    param = {
      maxFeePerGas: Number(feeData["maxFeePerGas"]) + Number(maxPriorityFee),

      maxPriorityFeePerGas: BigNumber.from(maxPriorityFeePerGas),
      gasLimit: Number(maxGasLimit),
    };
  }

  console.log("param: " + param);
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
    let amountOutMin;
    let amountIn;
    let amountOut;
    let amountInMaximum;
    let path = [];

    let fee;
    let sqrtPriceLimit;

    console.log("method", callData.methodName);
    console.log("router", router);
    console.log("router weth", router.wethAddress);
    console.log("isConfirmed ?", isConfirmed);
    let encodedDatas;

    switch (callData.methodName) {
      case "exactInputSingle":
        path[0] = callData.params.params.tokenIn;
        path[1] = callData.params.params.tokenOut;
        fee = callData.params.params.fee;
        amountIn = callData.params.params.amountIn;
        amountOutMinimum = callData.params.params.amountOutMinimum;
        sqrtPriceLimit = callData.params.params.sqrtPriceLimitX96;

        console.log("exactInputSingle 1");
        if (path[0] == router.wethAddress) {
          console.log("exactInputSingle 2");
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
              amountOutMinimum,
              BigNumber.from(utils.parseEther(config.maximumWeth)),
              BigNumber.from(utils.parseEther(config.minimumWeth)),
              BigNumber.from(utils.parseEther(config.amountPercentage))
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

            await performApprovalTransaction(
              provider,
              path[1],
              routerContract.address
            );
          }
        } else if (path[1] == routerContract.wethAddress) {
          console.log("exactInputSingle 3");

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

            console.log(
              "hello calculate sell",
              wallet0Balance.toString(),
              amountIn.toString(),
              ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
            );

            [amountIn, ratio] = await calculateSellAmount(
              wallet0Balance,
              amountIn,
              ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
            );

            amountOutMinimum = BigNumber.from(amountOutMinimum).div(ratio);

            encodedDatas = await createSellExactTokens(
              routerContract,
              path,
              fee,
              config.ourWallet,
              amountIn,
              amountOutMinimum,
              sqrtPriceLimit
            );

            tokensTransacted.push(path[0]);
            amountsTransacted.push(amountIn);
            transactedType.push(false);

            console.log("encoded datas sell", encodedDatas);
          }
        } else {
          console.log("exactInputSingle 4");

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
            ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
          );

          amountOutMinimum = BigNumber.from(amountOutMinimum).div(ratio);

          encodedDatas = await createSellExactTokens(
            routerContract,
            path,
            fee,
            config.ourWallet,
            amountIn,
            amountOutMinimum,
            sqrtPriceLimit
          );

          tokensTransacted.push(path[0]);
          amountsTransacted.push(amountIn);
          transactedType.push(false);

          tokensTransacted.push(path[1]);
          amountsTransacted.push(amountOutMinimum);
          transactedType.push(true);

          console.log("encoded datas simple buy", encodedDatas);
        }
        break;
      case "exactOutputSingle":
        path[0] = callData.params.params.tokenIn;
        path[1] = callData.params.params.tokenOut;
        fee = callData.params.params.fee;
        amountOut = callData.params.params.amountOut;
        amountInMaximum = callData.params.params.amountInMaximum;
        sqrtPriceLimit = callData.params.params.sqrtPriceLimitX96;

        console.log("exactOutputSingle 1");
        if (path[0] == router.wethAddress) {
          console.log("exactOutputSingle 2");
          //buy token

          if (isConfirmed) {
            updateChangedTokenBalance(
              metadata.from,
              path[1],
              amountInMaximum,
              true
            );
          } else {
            //get the budget
            //perform the transactions
            [amountInMaximum, amountOut] = calculateIOAmount(
              amountInMaximum,
              amountOut,
              BigNumber.from(utils.parseEther(config.maximumWeth)),
              BigNumber.from(utils.parseEther(config.minimumWeth)),
              BigNumber.from(utils.parseEther(config.amountPercentage))
            );
            encodedDatas = await createBuyWithExactTokens(
              routerContract,
              path,
              fee,
              config.ourWallet,
              amountInMaximum,
              amountOut,
              sqrtPriceLimit
            );

            console.log(
              "received exactOutputSingle encoded datas is",
              encodedDatas
            );
            tokensTransacted.push(path[1]);
            amountsTransacted.push(amountOut);

            transactedType.push(true);

            await performApprovalTransaction(
              provider,
              path[1],
              routerContract.address
            );
          }
        } else if (path[1] == routerContract.wethAddress) {
          console.log("exactInputSingle 3");

          //sell token
          if (isConfirmed) {
            updateChangedTokenBalance(
              metadata.from,
              metadata.path[0],
              amountInMaximum,
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

            [amountOut, ratio] = await calculateSellAmount(
              wallet0Balance,
              amountOut,
              ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
            );

            amountInMaximum = BigNumber.from(amountInMaximum).div(ratio);

            encodedDatas = await createSellExactTokens(
              routerContract,
              path,
              fee,
              config.ourWallet,
              amountOut,
              amountInMaximum,
              sqrtPriceLimit
            );

            tokensTransacted.push(path[0]);
            amountsTransacted.push(amountOut);
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

          [amountOut, ratio] = await calculateSellAmount(
            wallet0Balance,
            amountOut,
            ourBalance0 ? ourBalance.balance : BigNumber.from(0)
          );

          amountInMaximum = BigNumber.from(amountInMaximum).div(ratio);

          encodedDatas = await createSellExactTokens(
            routerContract,
            path,
            fee,
            config.ourWallet,
            amountInMaximum,
            amountOut,
            sqrtPriceLimit
          );

          tokensTransacted.push(path[0]);
          amountsTransacted.push(amountOut);
          transactedType.push(false);

          tokensTransacted.push(path[1]);
          amountsTransacted.push(amountInMaximum);
          transactedType.push(true);

          console.log("encoded datas simple buy", encodedDatas);
        }
    }

    if (isConfirmed) return;
    console.log("encoded datas up of is confirmed", encodedDatas);
    // transactionResult = encodedDatas;
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
