const { BigNumber, utils } = require('ethers');
const { calculateBudget, calculateProportions } = require('../budget/budget');
const { Configuration } = require('../database/model');
const { precision } = require('../utils/utils');

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

  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);


  try {
    //Perform Swap Exact Tokens for Tokens
    /**
        uint amountIn,
        uint amountOutMin,
        address[] calldata path, => [Selling Token, BuyingToken]
        address to,
        uint deadline
     */

    let roundingAmount = BigNumber.from('1000');
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
          value: BigNumber.from('0'),
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
    console.log('Error occurred on selling', err);
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


  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);

  let amountOut = amountIn;

  try {
    let roundingAmount = BigNumber.from('1000');

    let slippagePercentage = BigNumber.from(slippageData.slippagePercentage);
    let feePercentage = BigNumber.from(slippageData.feePercentage);

    //Get max weth from database
    const config = await Configuration.findOne({}).exec();
    let amountInWithSlippage = BigNumber.from(
      utils.parseUnits(config.maximumWeth, 'ether')
    );

    //calculate if v3
    if (!isV3) {
      let wethAmountData = await contract.getAmountsIn(amountOut, [
        sellingToken,
        buyingToken,
      ]);

      wethAmount = wethAmountData[0];
      console.log('weth amount', wethAmount.toString());
      let budgetAmount = calculateBudget(
        wethAmount,
        BigNumber.from(utils.parseEther(config.maximumWeth)),
        BigNumber.from(utils.parseEther(config.minimumWeth)),
        BigNumber.from(utils.parseEther(config.amountPercentage))
      );
      console.log('budget amount', budgetAmount.toString());
      let calculatedProportions = calculateProportions(
        budgetAmount,
        wethAmount
      );

      amountOut =
        budgetAmount < wethAmount
          ? amountOut.div(calculatedProportions).mul(precision)
          : amountOut.mul(calculatedProportions).div(precision);

      amountInWithSlippage = budgetAmount
        .add(budgetAmount.mul(slippagePercentage).div(roundingAmount))
        .add(budgetAmount.mul(feePercentage).div(roundingAmount));

      console.log('amount out', amountOut.toString());
      console.log('proportional amount out ', amountOut.toString());
    }

    let buyTransaction;

    if (isV3) {
      buyTransaction = await contract.swapTokensForExactTokens(
        amountOut,
        amountInWithSlippage,
        [sellingToken, buyingToken],
        to,
        {
          value: BigNumber.from('0'),
          ...params,
        }
      );
    } else
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
    return { ...buyTransactionData, amountOut };
  } catch (err) {
    console.log('Error occurred on buying!', err);
    return { status: false, amountOut };
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
      console.log('Token Already Approved');
      return { status: true };
    }

    const approveTransaction = await contract.approve(
      spender,
      BigNumber.from(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      ),
      {
        ...params,
      }
    );
    console.log('approve txn', approveTransaction);

    let approveTransactionResult = await approveTransaction.wait();
    return approveTransactionResult;
  } catch (err) {
    console.log('Error', err);
    return { status: false };
  }
};
module.exports = {
  performBuyTransaction,
  performTokenApprovalTransaction,
  performSellTransaction,
};
