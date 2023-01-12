//sell Exact Tokens: swapExactTokensForTokens => ExactInputParams

const createSellExactTokens = async (
  routerContract,
  path,
  fee,
  recipient,
  amountIn,
  amountOutMinimum,
  sqrtPriceLimitX96
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    tokenIn: path[0],
    tokenOut: path[1],
    fee,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96,
  };

  console.log("createSellExactTokens", params);
  return routerContract.interface.encodeFunctionData("exactInputSingle", [
    params,
  ]);
};

//sell For Exact Tokens: swapTokensForExactTokens => ExactOutputParams
const createSellForExactTokens = async (
  routerContract,
  path,
  fee,
  recipient,
  amountOut,
  amountInMaximum,
  sqrtPriceLimitX96
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    tokenIn: path[0],
    tokenOut: path[1],
    fee,
    recipient,
    deadline,
    amountOut,
    amountInMaximum,
    sqrtPriceLimitX96,
  };

  console.log("createSellForExactTokens", params);
  return routerContract.interface.encodeFunctionData("exactOutputSingle", [
    params,
  ]);
};

//buy Exact Tokens: swapTokensForExactTokens => ExactOutputParams
const createBuyExactTokens = async (
  routerContract,
  path,
  fee,
  recipient,
  amountOut,
  amountInMaximum,
  sqrtPriceLimitX96
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    tokenIn: path[0],
    tokenOut: path[1],
    fee,
    recipient,
    deadline,
    amountOut,
    amountInMaximum,
    sqrtPriceLimitX96,
  };
  console.log("createBuyExactTokens", params);

  return routerContract.interface.encodeFunctionData("exactOutputSingle", [
    params,
  ]);
};

//buy With Exact Tokens: swapExactTokensForTokens => ExactInputParams
const createBuyWithExactTokens = async (
  routerContract,
  path,
  fee,
  recipient,
  amountIn,
  amountOutMinimum,
  sqrtPriceLimitX96
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    tokenIn: path[0],
    tokenOut: path[1],
    fee,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96,
  };
  console.log("createBuyWithExactTokens", params);
  const encoded = routerContract.interface.encodeFunctionData(
    "exactInputSingle",
    [params]
  );

  console.log("encoded", encoded);
  return encoded;
};

//execute transaction
const executeTransactions = async (routerContract, encodedDatas, params) => {
  console.log("encoded data", encodedDatas);
  console.log("params", params);
  try {
    const multiCallTx = await routerContract.multicall([encodedDatas], {
      ...params,
    });

    const multiCallResult = await multiCallTx.wait();
    return multiCallResult;
  } catch (err) {
    console.log(err);
    return [{ status: 0 }];
  }
};

module.exports = {
  createSellExactTokens,
  createSellForExactTokens,
  createBuyExactTokens,
  createBuyWithExactTokens,
  executeTransactions,
};
