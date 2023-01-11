require("dotenv").config();
const { BigNumber } = require("ethers");
const {
  calculateProportions,
  calculateBudget,
  calculateIOAmount,
  calculateSellAmount,
} = require("../budget/budget");
const contract = require("../contracts/contract");
const {
  getERC20Contract,
  getRouterContract,
  getV3RouterContract,
} = require("../contracts/contract");
const {
  updateChangedTokenBalance,
  getAllWalletBalance,
} = require("../database/action");

const { Router, TokenBundle, Configuration } = require("../database/model");
const {
  performBuySaleTransaction,
  performBuySaleTransactionV3,
} = require("../memepool/performTxn");
const { getEthersProvider } = require("../utils/utils");

//swap for weth
const analyzeV2Transaction = async (
  methodName,
  currentRouterAddress,

  params,
  metadata,
  isConfirmed
) => {
  let currentConfiguration = await Configuration.findOne({}).exec();

  // API URL
  const API_URL = process.env.GOERLI_RPC;

  //Provider
  const provider = getEthersProvider(API_URL);

  //Uniswap Router Contract
  const routerContract = getRouterContract(provider, currentRouterAddress);

  //retrives the router info
  let currentRouterData = await Router.findOne({
    routerContract: currentRouterAddress,
  }).exec();

  let wethAddress = currentRouterData.wethAddress;

  let currentRouter = routerContract;

  let amountIn;
  let amountOutMin;
  let amountOut;
  let amountInMax;
  let path = params.path;
  let value = params.value;
  let isBuy = true;

  let walletBalance0 = await getAllWalletBalance(
    path[0],
    currentConfiguration.ourWallet
  );
  let walletBalance1 = await getAllWalletBalance(
    path[path.length - 1],
    currentConfiguration.ourWallet
  );

  let ourBalance0 = await TokenBundle.findOne({
    wallet: currentConfiguration.ourWallet,
    tokenAddress: path[0],
  }).exec();

  if (ourBalance0) ourBalance0 = ourBalance0.balance;
  else ourBalance0 = 0;

  let ourBalance1 = await TokenBundle.findOne({
    wallet: currentConfiguration.ourWallet,
    tokenAddress: path[path.length - 1],
  }).exec();

  if (ourBalance1) ourBalance1 = ourBalance1.balance;
  else ourBalance1 = 0;

  let ratio;

  console.log("Starting Of Method", methodName);

  switch (methodName) {
    //may be buy or sell
    case "swapExactTokensForTokens":
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;

      if (path[path.length - 1] == wethAddress) {
        // sell token
        isBuy = false;

        if (isConfirmed) {
          await updateChangedTokenBalance(
            metadata.from,
            path[0],
            amountIn,
            isBuy
          );
        } else {
          [amountIn, ratio] = calculateSellAmount(
            walletBalance0,
            amountIn,
            ourBalance0
          );

          await performBuySaleTransaction(
            provider,
            currentRouter,
            path[0],
            path[path.length - 1],
            amountIn,
            BigNumber.from(amountOutMin).div(ratio),
            isBuy,
            false,
            currentConfiguration,
            params,
            metadata
          );
        }
      } else {
        if (isConfirmed) {
          if (path[0] == wethAddress) {
            //buy other token
            await updateChangedTokenBalance(
              metadata.from,
              path[0],
              amountOutMin,
              isBuy
            );
          } else {
            if (isConfirmed) {
              await updateChangedTokenBalance(
                metadata.from,
                path[0],
                amountOutMin,
                true
              );
              await updateChangedTokenBalance(
                metadata.from,
                path[path.length - 1],
                amountOutMin,
                false
              );
            }
          }
        } else {
          [amountIn, amountOutMin] = calculateIOAmount(amountIn, amountOutMin);

          await performBuySaleTransaction(
            provider,
            currentRouter,
            path[0],
            path[path.length - 1],
            amountIn,
            amountOutMin,
            isBuy,
            true,
            currentConfiguration,
            params,
            metadata
          );
        }
      }

      break;
    case "swapTokensForExactTokens":
      amountInMax = params.amountInMax;
      amountOut = params.amountOut;

      if (path[0] == wethAddress) {
        if (isConfirmed) {
          await updateChangedTokenBalance(
            metadata.from,
            path[path.length - 1],
            amountOut,
            isBuy
          );
        }

        [amountInMax, amountOut] = calculateIOAmount(amountInMax, amountOut);

        //buy
        await performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountInMax,
          amountOut,
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      } // sell token
      else {
        //sale token
        if (path[path.length - 1] == wethAddress) {
          isBuy = false;

          if (isConfirmed) {
            await updateChangedTokenBalance(
              metadata.from,
              path[0],
              amountOut,
              isBuy
            );
          } else {
            [amountInMax, ratio] = calculateSellAmount(
              walletBalance0,
              amountInMax,
              ourBalance0
            );

            await performBuySaleTransaction(
              provider,
              currentRouter,
              path[0],
              path[path.length - 1],
              amountInMax,
              BigNumber.from(amountOut).div(ratio),
              isBuy,
              false,
              currentConfiguration,
              params,
              metadata
            );
          }
        } else {
          if (isConfirmed) {
            await updateChangedTokenBalance(
              metadata.from,
              path[0],
              amountOut,
              true
            );
            await updateChangedTokenBalance(
              wallet.from,
              path[path.length - 1],
              amountOut,
              false
            );
          } else {
            await performBuySaleTransaction(
              provider,
              currentRouter,
              path[0],
              path[path.length - 1],
              amountInMax,
              amountOut,
              isBuy,
              false,
              currentConfiguration,
              params,
              metadata
            );
          }
        }
      }

      break;

    //buy
    case "swapExactETHForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
      amountIn = value;
      amountOutMin = params.amountOutMin;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          wallet.from,
          path[path.length - 1],
          amountOutMin,
          isBuy
        );
      } else {
        [amountIn, amountOutMin] = calculateIOAmount(amountIn, amountOutMin);

        await performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          amountOutMin,
          isBuy,
          true,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
    case "swapETHForExactTokens":
      //amountOut: exact amount of tokens
      amountOut = params.amountOut;
      amountIn = value;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          metadata.from,
          path[path.length - 1],
          amountOut,
          isBuy
        );
      } else {
        [amountIn, amountOut] = calculateIOAmount(amountIn, amountOut);

        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          amountOut,
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
    //sell
    case "swapExactTokensForETH":
    //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
      //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;
      isBuy = false;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          metadata.from,
          path[0],
          amountIn,
          isBuy
        );
      } else {
        [amountIn, ratio] = calculateSellAmount(
          walletBalance0,
          amountIn,
          ourBalance0
        );
        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          BigNumber.from(amountOutMin).div(ratio),
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;

    case "swapTokensForExactETH":
      //amountOut: exactTokenAmount,
      // amountInMax: amount of token to be swapped should be smaller than the total
      amountOut = params.amountOut;
      amountInMax = params.amountInMax;
      isBuy = false;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          metadata.from,
          path[0],
          amountInMax,
          isBuy
        );
      } else {
        [amountInMax, ratio] = calculateSellAmount(
          walletBalance0,
          amountInMax,
          ourBalance0
        );
        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountInMax,
          BigNumber.from(amountOut).div(ratio),
          isBuy,
          true,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
  }
};

//swap for weth
const analyzeV3Transaction = async (
  subCalls,
  routerAddress,
  arguments,
  metadata,
  isConfirmed
) => {
  //we will get params and every methods
  //make sure we change the multicall from one method to another
  //like creating the multicall such that that call the corresponding
  //from here we need to create the multicall and call them
  //call them using contract functions
  let currentConfiguration = await Configuration.findOne({}).exec();
  //retrives the router info
  let currentRouterData = await Router.findOne({
    routerContract: currentRouterAddress,
  }).exec();
  // API URL
  const API_URL = currentRouterData.rpc;

  //Provider
  const provider = getEthersProvider(API_URL);

  const routerContract = getV3RouterContract(provider, routerAddress);

  performBuySaleTransactionV3(
    routerContract,
    currentRouterData,
    subCalls,
    currentRouterData.wethAddress,
    currentConfiguration,
    arguments,
    metadata,
    isConfirmed
  );
};
module.exports = {
  analyzeV2Transaction,
  analyzeV3Transaction,
};
