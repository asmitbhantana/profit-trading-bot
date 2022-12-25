require('dotenv').config();
const { BigNumber } = require('ethers');
const contract = require('../contracts/contract');
const {
  getERC20Contract,
  getRouterContract,
} = require('../contracts/contract');

const { Router, TokenBundle, Configuration } = require('../database/model');
const { performBuySaleTransaction } = require('../memepool/performTxn');
const { getEthersProvider } = require('../utils/utils');

//swap for weth
const anaylizeTransaction = async (
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
  let currentRouter = await Router.findOne({
    routerContract: currentRouterAddress,
  }).exec();

  let wethAddress = currentRouter.wethAddress;

  let amountIn;
  let amountOutMin;
  let amountOut;
  let amountInMax;
  let path = params.path;
  let deadline = params.deadline;
  let value = params.value;
  let isBuy = true;

  switch (methodName) {
    //may be buy or sell
    case 'swapExactTokensForTokens':
    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
      /**
       "params": {
        "amountIn": "1000", //how much amount is in 
        "amountOutMin": "1000", //how much should we get back, slippage ghatayunea
        "path": [
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          "0x60450439A3d91958E9Dae0918FC4e0d59a77f896"
        ],
        "to": "0xf8D8bA1F5f592C53eAe8F8d750a6b0F09ca31Cee",
        "deadline": "1771605566"
      }
      */
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;

      if (path[1] == wethAddress) {
        // sell token
        isBuy = false;
      }

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountIn,
        amountOutMin,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;
    case 'swapTokensForExactTokens':
      /**
       "params": {
        "amountOut": "1000", //yo fix
        "amountInMax": "1000", //kati badayera dinea, + slippage
        "path": [
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          "0x60450439A3d91958E9Dae0918FC4e0d59a77f896"
        ],
        "to": "0xf8D8bA1F5f592C53eAe8F8d750a6b0F09ca31Cee",
        "deadline": "1771605566"
      }
      */
      amountInMax = params.amountInMax;
      amountOut = params.amountOut;
      if (path[1] == wethAddress) {
        // sell token
        isBuy = false;
      }

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountInMax,
        amountOut,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;

    //buy
    case 'swapExactETHForTokens':
    case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
      /**
       "params": {
        "amountOutMin": "1000", //kati token ayynu paryo, slippage ghatayera
        "path": [
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          "0x60450439A3d91958E9Dae0918FC4e0d59a77f896"
        ],
        "to": "0xf8D8bA1F5f592C53eAe8F8d750a6b0F09ca31Cee",
        "deadline": "1771605566"
      }
      */
      amountIn = value;
      amountOutMin = params.amountOutMin;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountIn,
        amountOutMin,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;
    case 'swapETHForExactTokens':
      //amountOut: exact amount of tokens
      amountOut = params.amountOut;
      amountIn = value;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountIn,
        amountOut,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;
    //sell
    case 'swapExactTokensForETH':
    //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
    case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
      //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;
      isBuy = false;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountIn,
        amountOutMin,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;

    case 'swapTokensForExactETH':
      //amountOut: exactTokenAmount,
      // amountInMax: amount of token to be swapped should be smaller than the total
      amountOut = params.amountOut;
      amountInMax = params.amountInMax;
      isBuy = false;

      performBuySaleTransaction(
        provider,
        currentRouter,
        path[0],
        path[1],
        amountInMax,
        amountOut,
        isBuy,
        currentConfiguration,
        params,
        metadata
      );

      break;
  }
};

module.exports = {
  anaylizeTransaction,
};
