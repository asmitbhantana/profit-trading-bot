const { BigNumber } = require("ethers");
const {
  createUpdateConfig,
  createUpdateRouter,
  addRouter,
  createUpdateSlippageFee,
} = require("../database/action");
const { Configuration } = require("../database/model");
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
  const config = await Configuration.findOne({}).exec();

  const performTokenApprovalResult = await performApprovalTransaction(
    provider,
    tokenAddress,
    address,
    config
  );

  console.log("Approving tokens", performTokenApprovalResult);
};

const setSlippage = async () => {
  const updatedTokenFee = await createUpdateSlippageFee(
    slippage.slippagePercentage,
    slippage.feePercentage
  );
};

module.exports = {
  setConfig,
  addNewRouter,
  setSlippage,
  approveMaxToken,
};
