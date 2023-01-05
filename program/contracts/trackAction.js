const { BigNumber, utils } = require("ethers");
const { calculateBudget } = require("../budget/budget");
const { Configuration } = require("../database/model");

//it performs the selling of our tokens
const performSellTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountIn,
  to,
  isV3,

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

    let amountAfterSlippage = BigNumber.from(0);

    //if is not v3
    if (!isV3) {
      let amountOutData = await contract.getAmountsOut(amountIn, [
        sellingToken,
        buyingToken,
      ]);
      let amountOut = amountOutData[1];

      amountAfterSlippage = amountOut
        .sub(amountOut.mul(slippagePercentage).div(roundingAmount))
        .sub(amountOut.mul(feePercentage).div(roundingAmount));
    }
    let sellTransaction;
    if (isV3)
      sellTransaction = await contract.swapExactTokensForTokens(
        amountIn,
        amountAfterSlippage,
        [sellingToken, buyingToken],
        to,
        {
          ...params,
        }
      );
    else
      sellTransaction = await contract.swapExactTokensForTokens(
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
  isV3,

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

    //Get max weth from database
    const config = await Configuration.findOne({}).exec();
    let amountInWithSlippage = BigNumber.from(
      utils.parseUnits(config.maximumWeth, "ether")
    );

    //calculate if v3
    if (!isV3) {
      let wethAmountData = await contract.getAmountsIn(amountOut, [
        sellingToken,
        buyingToken,
      ]);

      wethAmount = wethAmountData[0];

      amountInWithSlippage = wethAmount
        .add(wethAmount.mul(slippagePercentage).div(roundingAmount))
        .add(wethAmount.mul(feePercentage).div(roundingAmount));
    }

    console.log("Performing the transactions!");
    let buyTransaction;

    if (isV3)
      buyTransaction = await contract.swapTokensForExactTokens(
        amountOut,
        amountInWithSlippage,
        [sellingToken, buyingToken],
        to,
        {
          ...params,
        }
      );
    else
      buyTransaction = await contract.swapTokensForExactTokens(
        amountOut,
        amountInWithSlippage,
        [sellingToken, buyingToken],
        to,
        timeRN,
        {
          ...params,
        }
      );

    //calculate with slippage

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

  params
) => {
  /**
   *
   */

  try {
    const allowance = await contract.allowance(
      contract.signer.address,
      spender
    );
    if (Number(allowance) > 0) {
      console.log("Token Already Approved");
      return { status: true };
    }
    const approveTransaction = await contract.approve(
      spender,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
      {
        ...params,
      }
    );
    let approveTransactionResult = await approveTransaction.wait();
    return approveTransactionResult;
  } catch (err) {
    console.log("Error", err);
    return { status: false };
  }
};
module.exports = {
  performBuyTransaction,
  performTokenApprovalTransaction,
  performSellTransaction,
};
