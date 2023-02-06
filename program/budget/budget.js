const { BigNumber, utils } = require("ethers");
const { precision } = require("../utils/utils");

require("../database/connection");

// const X = BigNumber.from(utils.parseEther("0.012")); //Absolute Maximum value
// const W = BigNumber.from(utils.parseEther("0.0001")); //Absolute Minimum value
// const Y = BigNumber.from("10"); //10 Percentage of buy amount

const calculateBudget = (buying_size, X, W, Y) => {
  console.log("X", X.toString());
  console.log("W", W.toString());
  console.log("Y", Y.toString());

  let B = buying_size;

  if (B.lte(X)) {
    B.lte(W) ? (B = W) : (B = B);
  } else {
    let Z = Y.mul(B).div(BigNumber.from(100));
    console.log("Z", Z.toString());
    console.log("B", B.toString());

    Z.gte(X) ? (B = X) : Z.lte(W) ? (B = W) : (B = Z);
  }

  console.log("Budget Amount", B.toString());
  return B;
};

const calculateProportions = (budgetAmount, wethAmount) => {
  let proportion = budgetAmount.lt(wethAmount)
    ? wethAmount.mul(precision).div(budgetAmount)
    : budgetAmount.mul(precision).div(wethAmount);

  console.log("Proportion is", proportion.toString());
  return proportion;
};

const calculateIOAmount = (amountIn, amountOut, X, W, Y) => {
  console.log("Amount in is", amountIn.toString());
  console.log("Amount out is", amountOut.toString());

  amountIn = BigNumber.from(amountIn);
  amountOut = BigNumber.from(amountOut);

  let budgetAmount = calculateBudget(amountIn, X, W, Y);
  let calculatedProportions = calculateProportions(budgetAmount, amountIn);

  let calcAmountOut = budgetAmount.lt(amountIn)
    ? amountOut.div(calculatedProportions).mul(precision)
    : amountOut.mul(calculatedProportions).div(precision);

  console.log("Calc amount out is", calcAmountOut.toString());
  return [budgetAmount, calcAmountOut];
};

const calculateSellAmount = (totalBalance, amountTransact, ourBalance) => {
  //calculate the transaction amount
  if (totalBalance == "0") {
    return [ourBalance, BigNumber.from(1)];
  }
  totalBalance = BigNumber.from(totalBalance);
  amountTransact = BigNumber.from(amountTransact);

  let ratio = totalBalance.lt(amountTransact)
    ? amountTransact.mul(precision).div(totalBalance)
    : totalBalance.mul(precision).div(amountTransact);

  console.log("ratio is", ratio.toString());
  console.log("total balance is", totalBalance.toString());
  console.log("amount transact is", amountTransact.toString());
  console.log("our balance is", ourBalance.toString());

  if (ratio.gt(BigNumber.from(10000))) ratio = BigNumber.from(10000);

  let ourAmountIn = BigNumber.from(ourBalance).div(ratio).mul(precision);

  console.log("our amount in", ourAmountIn.toString());

  let txnRatio = ourAmountIn.lt(amountTransact)
    ? amountTransact.mul(precision).div(ourAmountIn)
    : ourAmountIn.mul(precision).div(amountTransact);

  console.log("txn ratio is", txnRatio.toString());

  return [ourAmountIn, txnRatio];
};

module.exports = {
  calculateBudget,
  calculateProportions,
  calculateIOAmount,
  calculateSellAmount,
};
