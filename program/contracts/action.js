const { BigNumber } = require("ethers");
const { calculateBudget } = require("../budget/budget");

//it performs the selling of our tokens
const performSellTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountOut,
  to,

  params,
  slippageData
) => {
  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

  try {
    //Perform Swap Exact Tokens for Tokens
    /**
        uint amountIn,
        uint amountOutMin,
        address[] calldata path, => [Selling Token, BuyingToken]
        address to,
        uint deadline
     */

    let amountIn = BigNumber.from("0");
    let roundingAmount = BigNumber.from("1000");
    let slippagePercentage = BigNumber.from(slippageData.slippagePercentage);
    let feePercentage = BigNumber.from(slippageData.sellingFeePercentage);

    let amountAfterSlippage = amountOut
      .sub(amountOut.mul(slippagePercentage).div(roundingAmount))
      .sub(amountOut.mul(feePercentage).div(roundingAmount));

    const getAmountsOut = await contract.getAmountsOut(amountAfterSlippage, [
      buyingToken,
      sellingToken,
    ]);

    amountOut = getAmountsOut[0]; //total token amount
    amountIn = getAmountsOut[1]; //total weth amount

    const sellTransaction = await contract.swapExactTokensForTokens(
      amountOut,
      amountIn,
      [sellingToken, buyingToken],
      to,
      timeRN,
      {
        ...params,
      }
    );

    return [sellTransaction, amountOut];
  } catch (err) {
    console.log("Error occurred on selling", err);
    return [{ status: false }, 0];
  }
};

const performBuyTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountIn,
  to,

  params,
  slippageData
) => {
  //swap tokens for exact tokens
  //we need to swap token for exact number of other tokens
  //amount out is fix

  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

  try {
    let amountOutMin = BigNumber.from("0");
    let roundingAmount = BigNumber.from("1000");

    let slippagePercentage = BigNumber.from(slippageData.slippagePercentage);
    let feePercentage = BigNumber.from(slippageData.buyingFeePercentage);
    const amountInWithSlippage = amountIn
      .sub(amountOut.mul(slippagePercentage).div(roundingAmount))
      .add(amountOut.mul(feePercentage).div(roundingAmount));

    const getAmountsIn = await contract.getAmountsIn(amountInWithSlippage, [
      sellingToken,
      buyingToken,
    ]);
    amountOutMin = BigNumber.from(getAmountsIn[0]); //amount of weth
    amountIn = BigNumber.from(getAmountsIn[1]); //exact amount of token

    //perform budget tracking here since we are buying here !
    const calculatedAmountOut = calculateBudget(amountOutMin);
    //we have different amount of weth to spent
    if (calculatedAmountOut.toString() != amountOutMin.toString()) {
      const getAmountsIn2 = await contract.getAmountsOut(calculatedAmountOut, [
        buyingToken,
        sellingToken,
      ]);
      amountIn = BigNumber.from(getAmountsIn2[0]); //exact amount of token
      amountOutMin = BigNumber.from(getAmountsIn2[1]); //weth
    }

    //calculate with slippage
    const buyTransaction = await contract.swapTokensForExactTokens(
      amountOutMin,
      amountIn,
      [sellingToken, buyingToken],
      to,
      timeRN,
      {
        ...params,
      }
    );
    return [buyTransaction, amountOutMin];
  } catch (err) {
    console.log("Error occurred on buying!", err);
    return [{ status: false }, 0];
  }
};

const performTokenApprovalTransaction = async (
  contract,
  spender,
  value,

  params
) => {
  /**
   *
   */

  try {
    const allowance = await contract.allowance(contract.signer, spender);
    if (allowance > 0) {
      console.log("Token Already Approved");
      return { status: true };
    }
    const approveTransaction = await contract.approve(spender, value, {
      ...params,
    });
    let approveTransactionResult = await approveTransaction.wait();
    return approveTransactionResult;
  } catch (err) {
    return { status: false };
  }
};
module.exports = {
  performBuyTransaction,
  performTokenApprovalTransaction,
  performSellTransaction,
};
