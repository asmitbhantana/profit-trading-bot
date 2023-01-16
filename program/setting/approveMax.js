require("dotenv").config();
const { uniswapV3Router, uniswapV2Router } = require("../contracts/const");
const { Router } = require("../database/model");
const { getEthersProvider } = require("../utils/utils");
const { approveMaxToken } = require("./setting");
const approveDetail = require("./approve.json");

const approve = async () => {
  const spender = approveDetail.spender;
  const rpc = approveDetail.rpc;
  const tokenAddress = approveDetail.tokenAddress;

  const provider = getEthersProvider(rpc);
  await approveMaxToken(provider, spender, tokenAddress);
};

approve();
