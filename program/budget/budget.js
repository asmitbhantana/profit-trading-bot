const { BigNumber } = require("ethers");

const X = BigNumber.from("500000000000000000"); //Absolute Maximum value
const W = BigNumber.from("200000000000000000"); //Absolute Minimum value
const Y = BigNumber.from("10"); //10 Percentage of buy amount

const calculateBudget = (buying_size) => {
  let B = BigNumber.from(buying_size);

  if (B.lte(X)) {
    B.lte(W) ? (B = W) : (B = B);
  } else {
    Z = Y.mul(B).div(100);

    Z.gte(X) ? (B = X) : Z.lte(W) ? (B = W) : (B = Z);
  }

  return B;
};

const calculateAddressBuyProportions = (user, token_address) => {
  
}

module.exports = {
  calculateBudget: calculateBudget,
};
