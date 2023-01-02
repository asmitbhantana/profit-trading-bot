const { BigNumber } = require("ethers");
const {
  createUpdateConfig,
  createUpdateRouter,
  addRouter,
  createUpdateSlippageFee,
} = require("../database/action");
const { performApprovalTransaction } = require("../monitor/performTxn");
const config = require("../config/config.json");
const router = require("../config/router.json");

const setConfig = async () => {
  await createUpdateConfig(config);
};

const addNewRouter = async () => {
  await addRouter(router);
};

const approveMaxToken = async (provider, address, tokenAddress) => {
  const amount =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

  const performTokenApprovalResult = await performApprovalTransaction(
    provider,
    tokenAddress,
    address,
    BigNumber.from(amount)
  );

  console.log("Approving tokens", performTokenApprovalResult);
};

const addTokenSlippageFee = async (feePercentage, slippagePercentage) => {
  const updatedTokenFee = await createUpdateSlippageFee(
    feePercentage,
    slippagePercentage
  );

  console.log("Token Slippage", updatedTokenFee);
};

module.exports = {
  setConfig: setConfig,
  addNewRouter,
  addTokenSlippageFee,
  approveMaxToken,
};
