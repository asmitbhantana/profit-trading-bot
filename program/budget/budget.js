const { BigNumber, utils } = require("ethers");

require("../database/connection");

const X = BigNumber.from(utils.parseEther("0.012")); //Absolute Maximum value
const W = BigNumber.from(utils.parseEther("0.0001")); //Absolute Minimum value
const Y = BigNumber.from("10"); //10 Percentage of buy amount

const calculateBudget = (buying_size) => {
  let B = buying_size;

  if (B.lte(X)) {
    B.lte(W) ? (B = W) : (B = B);
  } else {
    Z = Y.mul(B).div(100);

    Z.gte(X) ? (B = X) : Z.lte(W) ? (B = W) : (B = Z);
  }

  console.log("Calculated ", B.toString());
  return B;
};

const calculateProportions = (budgetAmount, wethAmount) => {
  let proportion =
    budgetAmount < wethAmount
      ? wethAmount.div(budgetAmount)
      : budgetAmount.div(wethAmount);
  return proportion;
};

module.exports = {
  calculateBudget,
  calculateProportions,
};
