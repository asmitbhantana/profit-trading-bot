require("dotenv").config();
const { BigNumber } = require("ethers");
const contract = require("../contracts/contract");
const {
  getERC20Contract,
  getRouterContract,
  getV3RouterContract,
} = require("../contracts/contract");

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
  metadata
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
        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          amountOutMin,
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      } else {
        performBuySaleTransaction(
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
    case "swapTokensForExactTokens":
      amountInMax = params.amountInMax;
      amountOut = params.amountOut;
      if (path[path.length - 1] == wethAddress) {
        // sell token
        isBuy = false;
      }

      performBuySaleTransaction(
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

      break;

    //buy
    case "swapExactETHForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
      amountIn = value;
      amountOutMin = params.amountOutMin;

      performBuySaleTransaction(
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

      break;
    case "swapETHForExactTokens":
      //amountOut: exact amount of tokens
      amountOut = params.amountOut;
      amountIn = value;

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

      break;
    //sell
    case "swapExactTokensForETH":
    //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
      //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;
      isBuy = false;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[path.length - 1],
        amountIn,
        amountOutMin,
        isBuy,
        false,
        currentConfiguration,
        params,
        metadata
      );

      break;

    case "swapTokensForExactETH":
      //amountOut: exactTokenAmount,
      // amountInMax: amount of token to be swapped should be smaller than the total
      amountOut = params.amountOut;
      amountInMax = params.amountInMax;
      isBuy = false;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[path.length - 1],
        amountInMax,
        amountOut,
        isBuy,
        true,
        currentConfiguration,
        params,
        metadata
      );

      break;
  }
};

//swap for weth
const analyzeV3Transaction = async (
  subCalls,
  routerAddress,
  arguments,
  metadata
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
  const API_URL = process.env.GOERLI_RPC;

  //Provider
  const provider = getEthersProvider(API_URL);

  const routerContract = getV3RouterContract(provider, routerAddress);

  performBuySaleTransactionV3(
    routerContract,
    subCalls,
    currentRouterData.wethAddress,
    currentConfiguration,
    arguments,
    metadata
  );
};
module.exports = {
  analyzeV2Transaction,
  analyzeV3Transaction,
};
