require("dotenv").config();
const { uniswapV3Router, uniswapV2Router } = require("../contracts/const");
const { Router } = require("../database/model");
const { getEthersProvider } = require("../utils/utils");
const { approveMaxToken } = require("./setting");
const configDetail = require("./config.json");

const approve = async () => {
  const approves = configDetail["approvals"];

  approves.forEach(async (approveDetail) => {
    const spender = approveDetail.spender;
    const rpc = approveDetail.rpc;
    const tokenAddress = approveDetail.tokenAddress;

    const provider = getEthersProvider(rpc);
    await approveMaxToken(provider, spender, tokenAddress);
  });
};

approve();
