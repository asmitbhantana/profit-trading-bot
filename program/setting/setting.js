const { BigNumber } = require("ethers");
const {
  createUpdateConfig,
  createUpdateRouter,
  addRouter,
  createUpdateSlippageFee,
} = require("../database/action");
const { performApprovalTransaction } = require("../monitor/performTxn");
const config = require("./config.json");
const router = require("./router.json");
const slippage = require("./slippage.json");

//connect to the database
require("../database/connection");

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

const setSlippage = async () => {
  const updatedTokenFee = await createUpdateSlippageFee(
    slippage.feePercentage,
    slippage.slippagePercentage
  );

  console.log("Token Slippage", updatedTokenFee);
};

module.exports = {
  setConfig,
  addNewRouter,
  setSlippage,
  approveMaxToken,
};
