const { BigNumber } = require('ethers');
const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require('../contracts/action');
const { getERC20Contract } = require('../contracts/contract');

const performBuySaleTransaction = async (
  provider,
  contract,
  sellingToken,
  buyingToken,
  amountToBuy,
  wallet
) => {
  //prepare data
  let nonce = await provider.getTransactionCount(wallet);
  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    nonce: nonce,
    maxFeePerGas: feeData['maxFeePerGas'],
    gasLimit: 165123, //TODO: make this variable
  };

  nonce = await provider.getTransactionCount(wallet);
  param = {
    ...param,
    nonce: nonce,
  };

  const buyResult = await performBuyTransaction(
    contract,
    sellingToken,
    buyingToken,
    amountToBuy,
    0,
    wallet,
    param
  );

  return buyResult;
};

const performApprovalTransaction = async (
  provider,
  tokenAddress,
  spender,
  amountToBuy,
  wallet
) => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  const nonce = await provider.getTransactionCount(wallet);
  let feeData = await provider.getFeeData();

  let param = {
    type: 2,
    nonce: nonce,
    maxFeePerGas: feeData['maxFeePerGas'],
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
