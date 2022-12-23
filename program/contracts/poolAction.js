//normal or for selling tokens
const sellExactTokens = async (
  contract,
  sellingToken,
  buyingToken,
  wethAmount,
  amountToSell,
  wallet,
  params
) => {
  try {
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

    //swap tusdt for weth
    const sellTransaction = await contract.swapExactTokensForTokens(
      wethAmount, //amount of weth you want
      amountToSell, //amount out minimum with slippage
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );
    return [sellTransaction];
  } catch (err) {
    console.log("Error occured on memepool selling", err);
    return [{ status: false }, 0];
  }
};

//normal or for buying tokens
const buyExactTokens = async (
  contract,
  sellingToken,
  buyingToken,
  wethAmount,
  amountToBuy,
  wallet,
  params
) => {
  try {
    const timeRN = BigNumber.form(Math.round(Date.now() / 1000) + 100000000);

    const buyTransaction = await contract.swapTokensForExactTokens(
      amountToBuy, // amount you want to buy
      wethAmount, //max weth you can spend
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );
    return [buyTransaction];
  } catch (err) {
    console.log("Error occur on memepool buying", err);
  }
};
