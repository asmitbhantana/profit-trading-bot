const { BigNumber } = require("ethers");

//normal or for selling tokens
const sellExactTokens = async (
  contract,
  sellingToken,
  buyingToken,
  amountToSell,
  wethAmount,
  wallet,
  params
) => {
  try {
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

    console.log("Selling Amount", amountToSell.toString());
    console.log("Weth Amount", wethAmount.toString());

    //swap tusdt for weth
    const sellTransaction = await contract.swapExactTokensForTokens(
      amountToSell, //amount out minimum with slippage
      wethAmount, //amount of weth you want
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );

    const sellTransactionResult = await sellTransaction.wait();
    return [sellTransactionResult];
  } catch (err) {
    console.log("Error occured on memepool selling", err);
    return [{ status: false }, 0];
  }
};

//normal or for selling tokens
const sellForExactTokens = async (
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

    console.log("Selling Amount", amountToSell.toString());
    console.log("Weth Amount", wethAmount.toString());

    //swap tusdt for weth
    const sellTransaction = await contract.swapTokensForExactTokens(
      amountToSell, //amount out minimum with slippage
      wethAmount, //amount of weth you want
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );

    const sellTransactionResult = await sellTransaction.wait();
    return [sellTransactionResult];
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
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

    console.log("Buying Amount", amountToBuy.toString());
    console.log("Weth Amount", wethAmount.toString());
    const buyTransaction = await contract.swapTokensForExactTokens(
      amountToBuy, // amount you want to buy
      wethAmount, //max weth you can spend
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );

    const buyTransactionResult = await buyTransaction.wait();
    return [buyTransactionResult];
  } catch (err) {
    console.log("Error occur on memepool buying", err);

    return [{ status: 0 }];
  }
};

// or for buying tokens
const buyWithExactTokens = async (
  contract,
  sellingToken,
  buyingToken,
  wethAmount,
  amountToBuy,
  wallet,
  params
) => {
  try {
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 100000000);

    console.log("Buying Amount", amountToBuy.toString());
    console.log("Weth Amount", wethAmount.toString());
    const buyTransaction = await contract.swapExactTokensForTokens(
      amountToBuy, // amount you want to buy
      wethAmount, //max weth you can spend
      [sellingToken, buyingToken],
      wallet,
      timeRN,

      { ...params }
    );

    const buyTransactionResult = await buyTransaction.wait();
    return [buyTransactionResult];
  } catch (err) {
    console.log("Error occur on memepool buying", err);

    return [{ status: 0 }];
  }
};

module.exports = {
  buyExactTokens,
  sellExactTokens,
  buyWithExactTokens,
  sellForExactTokens,
};
