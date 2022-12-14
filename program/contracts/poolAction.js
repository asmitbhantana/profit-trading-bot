//we will need all the function on token tracking

//Indistinct--------------------------------

//swapExactTokensForTokens
/**
 * uint amountIn,    = Fix
 * uint amountOutMin = Calculated
 */

const swapExactTokensForTokens = async () => {};

//swapTokensForExactTokens
/**
 * uint amountOut,   = Fix
 * uint amountInMax, = Calculated + Slippage
 */

const swapTokensForExactTokens = async () => {};

//Buying--------------------------------

//swapExactETHForTokens
/**
 * msg.value,        = Fix
 * uint amountOutMin = Calculated - Slippage

 */

const swapExactETHForTokens = async () => {};

//swapETHForExactTokens
/**
 * msg.value = Calculated + Slippage,
 * uint amountOut = fix
 */

const swapETHForExactTokens = async () => {};

//Selling--------------------------------

//swapExactTokensForETH
/**
 * uint amountIn = Fix
 * uint amountOutMin = Calculated + Slippage
 */
const swapExactTokensForETH = async () => {};

// swapTokensForExactETH;
/*
 * uint amountOut = Fix
 * uint amountInMax = Calculated + Slippage
 */
const swapTokensForExactETH = async () => {};

module.exports = {
  swapExactTokensForTokens,
  swapTokensForExactTokens,
  swapExactETHForTokens,
  swapETHForExactTokens,
  swapExactTokensForETH,
  swapTokensForExactETH,
};
