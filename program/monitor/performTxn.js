const { BigNumber } = require("ethers");
const { isBytes } = require("ethers/lib/utils");
const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require("../contracts/action");
const { getERC20Contract } = require("../contracts/contract");

const performBuySaleTransaction = async (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountToBuy,
  wallet,
  isBuy
) => {
  //prepare data
  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    maxFeePerGas: feeData["maxFeePerGas"],
    gasLimit: 165123, //TODO: make this variable
  };

  param = {
    ...param,
  };

  const buyResult = await performBuyTransaction(
    contract,
    sellingToken,
    buyingToken,
    amountToBuy,
    0,
    wallet,
    param,
    isBuy
  );

  return buyResult;
};

const performApprovalTransaction = async (
  provider,
  tokenAddress,
  spender,
  amountToBuy
) => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    maxFeePerGas: feeData["maxFeePerGas"],
    gasLimit: 46568, //TODO: make this variable
  };

  const tokenApprovalResult = await performTokenApprovalTransaction(
    tokenContract,
    spender,
    amountToBuy,

    param
  );

  return tokenApprovalResult;
};

module.exports = {
  performBuySaleTransaction,
  performApprovalTransaction,
};
