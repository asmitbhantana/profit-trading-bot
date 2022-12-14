require("dotenv").config();
const { BigNumber } = require("ethers");
const contract = require("../contracts/contract");
const {
  getERC20Contract,
  getRouterContract,
} = require("../contracts/contract");
const {
  updateTokenBalance,
  createUpdateTokens,
} = require("../database/action");
const { Router, TokenBundle, Configuration } = require("../database/model");
const {
  performApprovalTransaction,
  performBuySaleTransaction,
} = require("../monitor/performTxn");
const { getEthersProvider } = require("../utils/utils");

//swap for weth
const performTransaction = async (methodName, currentRouterAddress, params) => {
  let currenConfiguration = await Configuration.findOne({}).exec();

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

  //retrive the token info

  //TODO: check router address
  switch (methodName) {
    //may be buy or sell
    case "swapExactTokensForTokens":
      break;
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
      break;
    case "swapExactTokenForExactTokens":
      break;
    case "swapTokensForExactTokens":
      console.log(methodName, " Method called");
      break;
    //buy
    case "swapExactETHForTokens":
      break;
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
      break;
    case "swapETHForExactTokens":
      console.log(methodName, "called => Buying Token");

      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        tokenAddress: params.path[1],
      }).exec();
      const ourBalanceNow = ourBalance
        ? BigNumber.from(ourBalance.balance)
        : BigNumber.from(0);

      const buyResult = await performBuySaleTransaction(
        provider,
        routerContract,
        currentRouter.wethAddress,
        params.path[1],
        params.amountOutMin,
        currenConfiguration.ourWallet,
        true
      );

      console.log("Buy Result", buyResult);
      if (buyResult.status) {
        console.log("Approving Tokens");
        const performTokenApprovalResult = await performApprovalTransaction(
          provider,
          params.path[1],
          routerContract.address,
          params.amountOutMin
        );
      } else {
        //failed to buy
        console.log(
          "Cannot Buy The Token:",
          params.path[1],
          "in",
          params.amountOutMin
        );
      }
      break;
    //sell
    case "swapExactTokensForETH":
      break;
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
      console.log("called => Selling Token => ", methodName);
      console.log("params ", params);
      console.log("router contract ", routerContract.address);

      //our current balance of the wallet from DB
      const ourBalance1 = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        tokenAddress: params.path[1],
      }).exec();
      const ourBalanceNow1 = ourBalance1
        ? BigNumber.from(ourBalance1.balance)
        : BigNumber.from(0);
      const sellResult = await performBuySaleTransaction(
        provider,
        routerContract,
        params.path[0],
        currentRouter.wethAddress,
        params.amountOutMin,
        currenConfiguration.ourWallet,
        false
      );
      //update our wallet amount on database

      break;

    case "swapTokensForExactETH":
      console.log("called => Selling Token => ", methodName);
      console.log("params ", params);
      console.log("router contract ", routerContract.address);

      //our current balance of the wallet from DB
      const ourBalance1_2 = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        tokenAddress: params.path[1],
      }).exec();
      const ourBalanceNow1_2 = ourBalance1_2
        ? BigNumber.from(ourBalance1_2.balance)
        : BigNumber.from(0);
      const sellResult_1 = await performBuySaleTransaction(
        provider,
        routerContract,
        params.path[0],
        currentRouter.wethAddress,
        params.amountOut,
        currenConfiguration.ourWallet,
        false
      );

      break;
  }
};
//swap to weth

module.exports = {
  performTransaction,
};
