const { BigNumber } = require('ethers');
const { getRouterContract } = require('./contract');

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

  params
) => {
  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);
  //Perform Swap Exact Tokens for Tokens
  /**
        uint amountIn,
        uint amountOutMin,
        address[] calldata path, => [Selling Token, BuyingToken]
        address to,
        uint deadline
     */
  const buyTransaction = await contract.swapExactTokensForTokens(
    amountIn,
    amountOutMin, //0
    [sellingToken, buyingToken],
    to,
    timeRN,
    {
      ...params,
    }
  );
  let buyTranscationResult = await buyTransaction.wait();
  return buyTranscationResult;
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
  const approveTransaction = await contract.approve(spender, value, {
    ...params,
  });
  let approveTransactionResult = await approveTransaction.wait();
  return approveTransactionResult;
};

module.exports = {
  performBuyTransaction,
  performTokenApprovalTransaction,
};
