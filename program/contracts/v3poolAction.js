//sell Exact Tokens: swapExactTokensForTokens => ExactInputParams

const { BigNumber } = require("ethers");

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
    // deadline, //TODO: should add deadline to Matic
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
    // deadline, //TODO: should add deadline to Matic
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
    // deadline, //TODO: should add deadline to Matic
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
  const deadline = Math.ceil(Date.now() / 1000) + 120;
  const params1 = {
    tokenIn: path[0],
    tokenOut: path[1],
    fee,
    recipient,
    deadline, //TODO: should add deadline to Matic
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96,
  };

  const encoded = routerContract.interface.encodeFunctionData(
    "exactInputSingle",
    [params1]
  );

  return encoded;
  // const result = await routerContract.exactInputSingle(encoded);
  // const txnResult = await result.wait();
  // console.log("encoded", encoded);
  // console.log("result", result);
  // return txnResult;
};

//execute transaction
const executeTransactions = async (routerContract, encodedDatas, params) => {
  const deadline = BigNumber.from(Math.ceil(Date.now() / 1000) + 120);

  console.log("encoded data", encodedDatas);
  console.log("router contract adddress", encodedDatas);
  try {
    const txArgs = {
      to: routerContract.address,
      from: routerContract.signer.address,
      data: encodedDatas,
      ...params,
    };
    console.log("tx args", txArgs);

    const tx = await routerContract.signer.sendTransaction(txArgs);
    console.log("performing txn...", tx);

    const receipt = await tx.wait();

    console.log("performing txn confirming...");
    return receipt;

    // const multiCallResult = await multiCallTx.wait();
    // return multiCallResult;
  } catch (err) {
    console.log("Error encountered", err);
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
