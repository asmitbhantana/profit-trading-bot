const { getERC20Contract } = require("../contracts/contract");
const {
  updateTokenBalance,
  createUpdateTokens,
} = require("../database/action");
const { Router, TokenBundle } = require("../database/model");
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
  const routerContract = getERC20Contract(provider, currentRouterAddress);
  //retrives the router info
  let currentRouter = await Router.findOne({
    routerContract: currentRouterAddress,
  }).exec();

  //TODO: check router address
  switch (methodName) {
    //may be buy or sell
    case "swapExactTokensForTokens":
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
    case "swapExactTokenForExactTokens":
    case "swapTokensForExactTokens":
      console.log(methodName, " Method called");
      break;
    //buy
    case "swapExactEthForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
    case "swapETHForExactTokens":
      console.log(methodName, "called => Buying Token");

      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        token_address: params.path[1],
      }).exec();
      const ourBalanceNow = ourBalance
        ? BigNumber.from(ourBalance.balance)
        : BigNumber.from(0);

      const buyResult = await performBuySaleTransaction(
        provider,
        routerContract,
        currentRouter.wethAddress,
        params.path[1],
        params.amountIn,
        currenConfiguration.ourWallet,
        true
      );

      console.log("Buy Result", buyResult);
      if (buyResult.status) {
        console.log("Approving Tokens", data.symbol);
        const performTokenApprovalResult = await performApprovalTransaction(
          provider,
          params.path[1],
          routerContract.address,
          amountToBuy
        );

        //update our wallet amount on database
        if (ourBalance) {
          const newBalance = ourBalanceNow.add(buyResult.amount);
          await updateTokenBalance(
            currenConfiguration.ourWallet,
            params.path[1],
            newBalance.toString()
          );
        } else {
          await createUpdateTokens(
            currenConfiguration.ourWallet,
            params.path[1],
            {
              wallet: currenConfiguration.ourWallet,
              token_address: params.path[1],
              name: data.name,
              decimal: data.decimals,
              symbol: data.symbol,
              logoURI: data.logoURI,
              chain: chains.name,
              network: data.network,
              balance: buyResult.amount.toString(),
            }
          );
        }
      } else {
        //failed to buy
        console.log(
          "Cannot Buy The Token:",
          params.path[1],
          "in",
          amountToBuy.toString()
        );
      }
      break;
    //sell
    case "swapExactTokensForETH":
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
    case "swapTokensForExactETH":
      console.log(methodName, "called => Selling Token");

      //our current balance of the wallet from DB
      const ourBalance1 = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        token_address: params.path[1],
      }).exec();
      const ourBalanceNow1 = ourBalance1
        ? BigNumber.from(ourBalance1.balance)
        : BigNumber.from(0);
      const sellResult = await performBuySaleTransaction(
        provider,
        routerContract,
        params.path[0],
        currentRouter.wethAddress,
        params.amountOut,
        currenConfiguration.ourWallet,
        false
      );
      //update our wallet amount on database
      if (sellResult.status) {
        if (ourBalance1) {
          const newBalance = ourBalanceNow1.sub(sellResult.amount);

          await updateTokenBalance(
            currenConfiguration.ourWallet,
            params.path[0],
            newBalance.toString()
          );
        } else {
          await createUpdateTokens(
            currenConfiguration.ourWallet,
            params.path[0],
            {
              wallet: currenConfiguration.ourWallet,
              token_address: params.path[0],
              name: data.name,
              decimal: data.decimals,
              symbol: data.symbol,
              logoURI: data.logoURI,
              chain: chains.name,
              network: data.network,
              balance: sellResult.amount.toString(),
            }
          );
        }
      } else {
        console.log(
          "Cannot Sell The Token:",
          params.path[0],
          amountToSell.toString()
        );
      }
      break;
  }
};
//swap to weth

module.exports = {
  performTransaction,
};
