//sell Exact Tokens: swapExactTokensForTokens => ExactInputParams

const createSellExactTokens = async (
  routerContract,
  path,
  recipient,
  deadline,
  amountIn,
  amountOutMinimum
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    path,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
  };

  return routerContract.interface.encodeFunctionData("exactInputSingle", [
    params,
  ]);
};

//sell For Exact Tokens: swapTokensForExactTokens => ExactOutputParams
const createSellForExactTokens = async (
  routerContract,
  path,
  recipient,
  deadline,
  amountOut,
  amountInMaximum
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    path,
    recipient,
    deadline,
    amountOut,
    amountInMaximum,
  };

  return routerContract.interface.encodeFunctionData("exactOutputSingle", [
    params,
  ]);
};

//buy Exact Tokens: swapTokensForExactTokens => ExactOutputParams
const createBuyExactTokens = async (
  routerContract,
  path,
  recipient,
  deadline,
  amountOut,
  amountInMaximum
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    path,
    recipient,
    deadline,
    amountOut,
    amountInMaximum,
  };

  return routerContract.interface.encodeFunctionData("exactOutputSingle", [
    params,
  ]);
};

//buy With Exact Tokens: swapExactTokensForTokens => ExactInputParams
const createBuyWithExactTokens = async (
  routerContract,
  path,
  recipient,
  deadline,
  amountIn,
  amountOutMinimum
) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const params = {
    path,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
  };

  return routerContract.interface.encodeFunctionData("exactInputSingle", [
    params,
  ]);
};

//execute transaction
const executeTransactions = async (routerContract, encodedDatas, params) => {
  const deadline = Math.ceil(Date.now() / 1000) + 10000;

  const multiCallTx = await routerContract.multicall(deadline, encodedDatas, {
    ...params,
  });

  const multiCallResult = await multiCallTx.wait();
  return multiCallResult;
};

module.exports = {
  createSellExactTokens,
  createSellForExactTokens,
  createBuyExactTokens,
  createBuyWithExactTokens,
  executeTransactions,
};
