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
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);

    console.log("Selling Amount", amountToSell.toString());
    console.log("Weth Amount", wethAmount.toString());
    console.log("params ", params);
    //swap tusdt for weth
    const sellTransaction =
      await contract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
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
    console.log("Error occured on memepool selling 1", err);
    let errorContainReplacementfeeLow = err
      .toString()
      .includes("REPLACEMENT_UNDERPRICED");
    if (errorContainReplacementfeeLow) {
      let currentNonce = params.nonce + 1;
      console.log("retrying with nonce", currentNonce);

      let retryResult = await sellExactTokens(
        contract,
        sellingToken,
        buyingToken,
        amountToSell,
        wethAmount,
        wallet,
        { ...params, nonce: currentNonce }
      );

      return retryResult;
    } else {
      return [{ status: false }, 0];
    }
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
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);

    console.log("Selling Amount", amountToSell.toString());
    console.log("Weth Amount", wethAmount.toString());
    console.log("params ", params);

    //swap tusdt for weth
    const sellTransaction =
      await contract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountToSell, //amount out minimum with slippage
        wethAmount, //amount of weth you want
        [sellingToken, buyingToken],
        wallet,
        timeRN,

        { ...params, value: "0" }
      );

    const sellTransactionResult = await sellTransaction.wait();
    return [sellTransactionResult];
  } catch (err) {
    console.log("Error occured on memepool selling 2", err);
    let errorContainReplacementfeeLow = err
      .toString()
      .includes("REPLACEMENT_UNDERPRICED");
    if (errorContainReplacementfeeLow) {
      let currentNonce = params.nonce + 1;
      console.log("retrying with nonce", currentNonce);

      let retryResult = await sellForExactTokens(
        contract,
        sellingToken,
        buyingToken,
        wethAmount,
        amountToSell,
        wallet,
        { ...params, nonce: currentNonce }
      );

      return retryResult;
    } else {
      return [{ status: false }, 0];
    }
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
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);

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
    console.log("Error occur on memepool buying 1", err);
    let errorContainReplacementfeeLow = err
      .toString()
      .includes("REPLACEMENT_UNDERPRICED");
    if (errorContainReplacementfeeLow) {
      let currentNonce = params.nonce + 1;
      console.log("retrying with nonce", currentNonce);

      let retryResult = await buyExactTokens(
        contract,
        sellingToken,
        buyingToken,
        wethAmount,
        amountToBuy,
        wallet,
        { ...params, nonce: currentNonce }
      );

      return retryResult;
    } else {
      return [{ status: 0 }];
    }
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
    const timeRN = BigNumber.from(Math.round(Date.now() / 1000) + 60 * 3);

    console.log("Buying Amount", amountToBuy.toString());
    console.log("Weth Amount", wethAmount.toString());
    console.log("selling token", sellingToken);
    console.log("buying token", buyingToken);
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
    console.log("Error occur on memepool buying 2", err);
    let errorContainReplacementfeeLow = err
      .toString()
      .includes("REPLACEMENT_UNDERPRICED");
    if (errorContainReplacementfeeLow) {
      let currentNonce = params.nonce + 1;
      console.log("retrying with nonce", currentNonce);

      let retryResult = await buyWithExactTokens(
        contract,
        sellingToken,
        buyingToken,
        wethAmount,
        amountToBuy,
        wallet,
        { ...params, nonce: currentNonce }
      );

      return retryResult;
    } else {
      return [{ status: 0 }];
    }
  }
};

module.exports = {
  buyExactTokens,
  sellExactTokens,
  buyWithExactTokens,
  sellForExactTokens,
};
