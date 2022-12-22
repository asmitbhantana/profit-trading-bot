const sellExactTokens = (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amount,
  params
) => {
  const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);
};

const buyExactTokens = (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountToBuy,
  wallet,
  params
) => {};

const swapExactTokensForTokens = (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountIn,
  amountOut,
  wallet,
  params
) => {};
