const { BigNumber } = require('ethers');
const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require('../contracts/action');
const { getERC20Contract } = require('../contracts/contract');

const performBuySaleTransaction = async (provider, contract) => {
  const tusd = '0x60450439A3d91958E9Dae0918FC4e0d59a77f896';
  const abc = '0x733dFB5f428c517bF80A72ACeC969B58b857AeF0';
  const amountToBuy = BigNumber.from('1000000000000');
  const wallet = '0xD114dDe767a972Eb3665840b14F78FaEE3943E80';

  //prepare data
  let nonce = await provider.getTransactionCount(wallet);
  let feeData = await provider.getFeeData();

  console.log(contract);
  let param = {
    type: 2,
    nonce: nonce,
    maxFeePerGas: feeData['maxFeePerGas'],
    gasLimit: 165123, //TODO: make this variable
  };

  // approval of tusd and abc
  const tusdToken = getERC20Contract(provider, tusd);
  const tusdApproval = await performTokenApprovalTransaction(
    tusdToken,
    contract.address,
    amountToBuy,

    param
  );
  console.log('approval', tusdApproval);

  nonce = await provider.getTransactionCount(wallet);
  param = {
    ...param,
    nonce: nonce,
  };

  // approval of abc
  // const abcToken = getERC20Contract(provider, abc);
  // const abcApproval = await performTokenApprovalTransaction(
  //   abcToken,
  //   contract.address,
  //   amountToBuy,

  //   param
  // );
  // console.log('approval', abcApproval);

  const buyResult = await performBuyTransaction(
    contract,
    tusd,
    abc,
    amountToBuy,
    0,
    wallet,
    param
  );

  console.log('buyResult', buyResult);
};

module.exports = {
  performBuySaleTransaction,
};
