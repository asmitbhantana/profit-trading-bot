const { BigNumber } = require("ethers");
/*
 * A => Buying Token
 * B => Selling Token
 */

/**
 * Token Address A, buying token Address
 * Token Address B, selling token for buying A
 *
 */

/*
 * Example
 * selling shiba inu means buying weth and
 * buying shiba inu means selling weth
 *
 * maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"], // Recommended maxPriorityFeePerGas
 * maxFeePerGas: feeData["maxFeePerGa
 */

/**
 * 
    value: ethers.utils.parseEther("1"),
    type: 2,
    maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei"),
    gasLimit: 35_000,
 */
const performBuyTransaction = async (
  contract,
  sellingToken,
  buyingToken,
  amountIn,
  amountOutMin,
  to,

  params,
  isBuy
) => {
  try {
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);
    //Perform Swap Exact Tokens for Tokens
    /**
        uint amountIn,
        uint amountOutMin,
        address[] calldata path, => [Selling Token, BuyingToken]
        address to,
        uint deadline
     */
    if (isBuy) {
      const getAmountsIn = await contract.getAmountsIn(amountIn, [
        sellingToken,
        buyingToken,
      ]);
      amountIn = BigNumber.from(getAmountsIn[0]);
      amountOutMin = BigNumber.from(getAmountsIn[1]);

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

      return [buyTransaction, amountIn];
    } else {
      const sellTransaction = await contract.swapExactTokensForTokens(
        amountIn,
        0, //TODO:: perform frontrun
        [sellingToken, buyingToken],
        to,
        timeRN,
        {
          ...params,
        }
      );

      return [sellTransaction, amountIn];
    }
  } catch (err) {
    console.log("Error occured", err);
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
};
