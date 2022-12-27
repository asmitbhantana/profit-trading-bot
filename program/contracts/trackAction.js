const { BigNumber } = require("ethers");
const { calculateBudget } = require("../budget/budget");

//it performs the selling of our tokens
const performSellTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountIn,
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

    let roundingAmount = BigNumber.from("1000");
    let slippagePercentage = BigNumber.from(slippageData.slippagePercentage);
    let feePercentage = BigNumber.from(slippageData.feePercentage);

    let amountOutData = await contract.getAmountsOut(amountIn, [
      sellingToken,
      buyingToken,
    ]);
    let amountOut = amountOutData[1];

    let amountAfterSlippage = amountOut
      .sub(amountOut.mul(slippagePercentage).div(roundingAmount))
      .sub(amountOut.mul(feePercentage).div(roundingAmount));

    const sellTransaction = await contract.swapExactTokensForTokens(
      amountIn,
      amountAfterSlippage,
      [sellingToken, buyingToken],
      to,
      timeRN,
      {
        ...params,
      }
    );

    const sellTransactionData = await sellTransaction.wait();
    return sellTransactionData;
  } catch (err) {
    console.log("Error occurred on selling", err);
    return { status: false };
  }
};

const performBuyTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountIn, //we require it to get
  to,

  params,
  slippageData
) => {
  //swap tokens for exact tokens
  //we need to swap token for exact number of other tokens
  //amount out is fix

  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

  try {
    let amountOut = amountIn;
    let roundingAmount = BigNumber.from("1000");

    let slippagePercentage = BigNumber.from(slippageData.slippagePercentage);
    let feePercentage = BigNumber.from(slippageData.feePercentage);

    let wethAmountData = await contract.getAmountsIn(amountOut, [
      sellingToken,
      buyingToken,
    ]);

    wethAmount = wethAmountData[0];

    const amountInWithSlippage = wethAmount
      .add(wethAmount.mul(slippagePercentage).div(roundingAmount))
      .add(wethAmount.mul(feePercentage).div(roundingAmount));

    console.log("Performing the transactions!");

    //calculate with slippage
    const buyTransaction = await contract.swapTokensForExactTokens(
      amountOut,
      amountInWithSlippage,
      [sellingToken, buyingToken],
      to,
      timeRN,
      {
        ...params,
      }
    );

    const buyTransactionData = await buyTransaction.wait();
    return buyTransactionData;
  } catch (err) {
    console.log("Error occurred on buying!", err);
    return { status: false };
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
    if (allowance) {
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
