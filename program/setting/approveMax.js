require("dotenv").config();
const { uniswapV3Router } = require("../contracts/const");
const { Router } = require("../database/model");
const { getEthersProvider } = require("../utils/utils");
const { approveMaxToken } = require("./setting");

const approve = async () => {
  const API_URL = process.env.GOERLI_RPC;
  const provider = getEthersProvider(API_URL);

  const routerAddress = uniswapV3Router;
  const router = await Router.findOne({
    routerContract: routerAddress,
  });
  console.log("routerAddress", routerAddress);
  console.log("wethAddress", router.wethAddress);
  await approveMaxToken(provider, routerAddress, router.wethAddress);
};

approve();
