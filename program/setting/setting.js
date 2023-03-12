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

//connect to the database
require("../database/connection");

const setConfig = async () => {
  await createUpdateConfig(config["botConfig"]);
  console.log("Configuration Added");
};

const addNewRouter = async () => {
  const routers = config["routers"];
  routers.forEach(async (router, index) => {
    await addRouter(router);
    console.log("Added  ", index, " routers");
  });
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
  const slippage = config["slippage"];
  const updatedTokenFee = await createUpdateSlippageFee(
    slippage.slippagePercentage,
    slippage.feePercentage
  );
  console.log("Done Slippage Set");
};

module.exports = {
  setConfig,
  addNewRouter,
  setSlippage,
  approveMaxToken,
};
