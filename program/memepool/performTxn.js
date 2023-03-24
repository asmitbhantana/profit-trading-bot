//gas limit check,
//priority fee set, frontrun
//add in the database
//update database with the amount of token bought sold

const { BigNumber, ethers, utils } = require("ethers");
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
  updateTransaction,
} = require("../database/action");
const { TokenBundle } = require("../database/model");
const {
  createSellExactTokens,
  createBuyWithExactTokens,
  createBuyExactTokens,
  executeTransactions,
  createSellForExactTokens,
} = require("../contracts/v3poolAction");
const { calculateIOAmount, calculateSellAmount } = require("../budget/budget");
const { performApprovalTransaction } = require("../monitor/performTxn");
const { precision, getCurrentNonce } = require("../utils/utils");

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
  let param = {};
  let nonce = getCurrentNonce(provider, contract.signer.getAddress());
  let untrackedTokens = config.untrackedTokens;

  if (
    untrackedTokens.includes(buyingToken) ||
    untrackedTokens.includes(sellingToken)
  )
    return;

  if (metadata.maxFeePerGas == 0) {
    let feeData = await provider.getFeeData();
    param = {
      maxFeePerGas: feeData["maxFeePerGas"],
      gasLimit: "331109",
      nonce: nonce,
    };
  } else {
    param = {
      maxFeePerGas: Math.floor(
        (Number(metadata.maxFeePerGas) * Number(config.maxFeePerGasIncrease)) /
          100
      ),
      maxPriorityFeePerGas: Math.floor(
        (Number(metadata.maxPriorityFeePerGas) *
          Number(config.maxPriorityFeePerGasIncrease)) /
          100
      ),
      gasLimit: metadata.gasLimit,
      nonce: nonce,
    };
  }

  if (param.maxFeePerGas > config.maximumFeePerGas) {
    param.maxFeePerGas = config.maximumFeePerGas;
    param.maxPriorityFeePerGas = config.maximumFeePerGas;
  }
  console.log("Fee Param", param);
  console.log("Performing BuySale Transactions with Arg", arguments);
  console.log("Performing BuySale Transactions with Metadata", metadata);

  let isBuyingToken = false;

  await updateTransaction(metadata.txnHash, {
    ourTimeStamp: new Date(),
    ourMaxGwei: param.maxFeePerGas,
    ourMaxPriorityGwei: param.maxPriorityFeePerGas,
    ourGasLimit: metadata.gasLimit,
  });

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

      await updateTransaction(metadata.txnHash, {
        ourTokenAmount: buyingAmount.toString(),
        tokenContract: buyingToken,
        transactionType: "Buy",
      });

      isBuyingToken = true;
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

      await updateTransaction(metadata.txnHash, {
        ourTokenAmount: buyingAmount.toString(),
        tokenContract: buyingToken,
        transactionType: "Buy",
      });
      isBuyingToken = true;
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

      await updateTransaction(metadata.txnHash, {
        ourTokenAmount: buyingAmount.toString(),
        tokenContract: buyingToken,
        transactionType: "Sell",
      });
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
      await updateTransaction(metadata.txnHash, {
        ourTokenAmount: sellingAmount.toString(),
        tokenContract: sellingToken,
        transactionType: "Sell",
      });
    }
  }
  console.log("Transaction Result is", transactionResult);
  if (transactionResult[0].status == 1) {
    updateChangedTokenBalance(config.ourWallet, tokenTransacted, provider);
    await updateTransaction(metadata.txnHash, {
      ourHash: transactionResult[0].transactionHash,
      ourTransactionResult: "Confirmed",
      ourGasUsed: transactionResult[0].gasUsed.toString(),
    });

    await performApprovalTransaction(
      provider,
      tokenTransacted,
      metadata.to,
      config
    );
  } else {
    await updateTransaction(metadata.txnHash, {
      ourHash: transactionResult[0].transactionHash,
      ourTransactionResult: `Failed ${transactionResult.reason}`,
    });
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
  let param = {};
  let nonce = getCurrentNonce(provider, routerContract.signer.getAddress());

  if (metadata.maxFeePerGas == 0) {
    let feeData = await provider.getFeeData();
    param = {
      maxFeePerGas: feeData["maxFeePerGas"],
      gasLimit: "428356",
      nonce: nonce,
    };
  } else {
    param = {
      maxFeePerGas: Math.floor(
        (Number(metadata.maxFeePerGas) * Number(config.maxFeePerGasIncrease)) /
          100
      ),
      maxPriorityFeePerGas: Math.floor(
        (Number(metadata.maxPriorityFeePerGas) *
          Number(config.maxPriorityFeePerGasIncrease)) /
          100
      ),
      gasLimit: metadata.gasLimit,
      nonce: nonce,
    };
  }

  if (param.maxFeePerGas > config.maximumFeePerGas) {
    param.maxFeePerGas = config.maximumFeePerGas;
    param.maxPriorityFeePerGas = config.maximumFeePerGas;
  }

  console.log("param: " + param);

  await updateTransaction(metadata.txnHash, {
    ourTimeStamp: new Date(),
    ourMaxGwei: param.maxFeePerGas,
    ourMaxPriorityGwei: param.maxPriorityFeePerGas,
    ourGasLimit: metadata.gasLimit,
  });

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
        fee = callData.params.params.fee || 3000;
        amountIn = callData.params.params.amountIn;
        amountOutMinimum = callData.params.params.amountOutMinimum;
        sqrtPriceLimit = callData.params.params.sqrtPriceLimitX96 || 0;

        console.log("exactInputSingle 1", callData);
        console.log("path[0]=>", path[0]);
        console.log("router weth address", router.wethAddress);

        if (path[0].toLowerCase() == router.wethAddress.toLowerCase()) {
          console.log("exactInputSingle 2");
          //buy token

          if (isConfirmed) {
            updateChangedTokenBalance(metadata.from, path[1], provider);
          } else {
            //get the budget
            //perform the transactions
            [amountIn, amountOutMinimum] = calculateIOAmount(
              amountIn,
              amountOutMinimum,
              BigNumber.from(utils.parseEther(config.maximumWeth)),
              BigNumber.from(utils.parseEther(config.minimumWeth)),
              BigNumber.from(config.amountPercentage)
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

            await updateTransaction(metadata.txnHash, {
              tokenContract: path[1],
              transactedType: "Buy",
            });
          }
        } else if (path[1].toLowerCase() == router.wethAddress.toLowerCase()) {
          console.log("exactInputSingle 3");

          //sell token
          if (isConfirmed) {
            updateChangedTokenBalance(metadata.from, path[0], provider);
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

            if (!ourBalance0) return;

            [amountIn, ratio] = await calculateSellAmount(
              wallet0Balance,
              amountIn,
              ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
            );

            amountOutMinimum = BigNumber.from(amountOutMinimum)
              .div(ratio)
              .mul(precision);

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
            await updateTransaction(metadata.txnHash, {
              tokenContract: path[0],
              transactedType: "Sell",
              ourTokenAmount: amountIn,
            });
          }
        } else {
          console.log("exactInputSingle 4");

          //sell token
          // const wallet0Balance = await getAllWalletBalance(
          //   path[0],
          //   config.ourWallet
          // );
          // let ourBalance0 = await TokenBundle.findOne({
          //   wallet: config.ourWallet,
          //   tokenAddress: path[0],
          // }).exec();

          // [amountIn, ratio] = await calculateSellAmount(
          //   wallet0Balance,
          //   amountIn,
          //   ourBalance0 ? ourBalance0.balance : BigNumber.from(0)
          // );

          // amountOutMinimum = BigNumber.from(amountOutMinimum)
          //   .div(ratio)
          //   .mul(precision);

          // console.log("amount in", amountIn);
          // console.log("amount out", amountOutMinimum);
          // console.log("ratio", ratio);

          // encodedDatas = await createSellExactTokens(
          //   routerContract,
          //   path,
          //   fee,
          //   config.ourWallet,
          //   amountIn,
          //   amountOutMinimum,
          //   sqrtPriceLimit
          // );

          // tokensTransacted.push(path[0]);
          // amountsTransacted.push(amountIn);
          // transactedType.push(false);

          // tokensTransacted.push(path[1]);
          // amountsTransacted.push(amountOutMinimum);
          // transactedType.push(true);

          // console.log("encoded datas simple buy", encodedDatas);
        }
        break;
      case "exactOutputSingle":
        path[0] = callData.params.params.tokenIn;
        path[1] = callData.params.params.tokenOut;
        fee = callData.params.params.fee || 3000;
        amountOut = callData.params.params.amountOut;
        amountInMaximum = callData.params.params.amountInMaximum;
        sqrtPriceLimit = callData.params.params.sqrtPriceLimitX96 || 0;

        console.log("exactOutputSingle 1", callData);
        if (path[0].toLowerCase() == router.wethAddress.toLowerCase()) {
          console.log("exactOutputSingle 2");
          //buy token

          if (isConfirmed) {
            updateChangedTokenBalance(metadata.from, path[1], provider);
          } else {
            //get the budget
            //perform the transactions

            [amountInMaximum, amountOut] = calculateIOAmount(
              // [amountOut, amountInMaximum] = calculateIOAmount(
              amountOut,
              amountInMaximum,
              BigNumber.from(utils.parseEther(config.maximumWeth)),
              BigNumber.from(utils.parseEther(config.minimumWeth)),
              BigNumber.from(config.amountPercentage)
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

            await updateTransaction(metadata.txnHash, {
              tokenContract: path[1],
              transactedType: "Buy",
              ourTokenAmount: amountOut,
            });
          }
        } else if (path[1].toLowerCase() == router.wethAddress.toLowerCase()) {
          console.log("exactInputSingle 3");

          //sell token
          if (isConfirmed) {
            updateChangedTokenBalance(metadata.from, path[0], provider);
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

            amountInMaximum = BigNumber.from(amountInMaximum)
              .div(ratio)
              .mul(precision);

            console.log("amountInMaximum: " + amountInMaximum.toString());
            console.log("amountOut: " + amountOut.toString());

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

            await updateTransaction(metadata.txnHash, {
              tokenContract: path[0],
              transactedType: "Sell",
              ourTokenAmount: amountInMaximum,
            });
          }
        } else {
          //sell token
          // const wallet0Balance = await getAllWalletBalance(
          //   path[0],
          //   config.ourWallet
          // );
          // let ourBalance0 = await TokenBundle.findOne({
          //   wallet: config.ourWallet,
          //   tokenAddress: path[0],
          // }).exec();
          // [amountOut, ratio] = await calculateSellAmount(
          //   wallet0Balance,
          //   amountOut,
          //   ourBalance0 ? ourBalance.balance : BigNumber.from(0)
          // );
          // amountInMaximum = BigNumber.from(amountInMaximum)
          //   .div(ratio)
          //   .mul(precision);
          // encodedDatas = await createSellExactTokens(
          //   routerContract,
          //   path,
          //   fee,
          //   config.ourWallet,
          //   amountInMaximum,
          //   amountOut,
          //   sqrtPriceLimit
          // );
          // tokensTransacted.push(path[0]);
          // amountsTransacted.push(amountOut);
          // transactedType.push(false);
          // tokensTransacted.push(path[1]);
          // amountsTransacted.push(amountInMaximum);
          // transactedType.push(true);
          // console.log("encoded datas simple buy", encodedDatas);
        }
    }

    if (isConfirmed) return;
    console.log("txn not confirmed", encodedDatas);

    if (encodedDatas == undefined) return;
    console.log("txn data encoded is", encodedDatas);

    // transactionResult = encodedDatas;
    transactionResult = await executeTransactions(
      routerContract,
      encodedDatas,
      param
    );

    console.log("txn Result is", transactionResult);

    if (transactionResult.status == 1) {
      amountsTransacted.forEach(async (amountTransacted, index) => {
        //update user balance on the database

        await updateChangedTokenBalance(
          config.ourWallet,
          tokensTransacted[index],
          provider
        );
        await updateTransaction(metadata.txnHash, {
          ourHash: transactionResult.transactionHash,
          ourTransactionResult: "Confirmed",
          ourGasUsed: transactionResult.gasUsed.toString(),
        });
      });

      tokensTransacted.forEach(async (tokenTransacted, index) => {
        //perform token approval for token bought

        if (transactedType[index]) {
          await performApprovalTransaction(
            provider,
            tokenTransacted,
            routerContract.address,
            config
          );
        }
      });
    } else {
      await updateTransaction(metadata.txnHash, {
        ourHash: transactionResult.transactionHash,
        ourTransactionResult: `Failed ${transactionResult.reason}`,
      });
    }
  });
};

module.exports = {
  performBuySaleTransaction,
  performBuySaleTransactionV3,
};
