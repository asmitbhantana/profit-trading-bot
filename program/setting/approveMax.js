require("dotenv").config();
const { uniswapV3Router, uniswapV2Router } = require("../contracts/const");
const { Router } = require("../database/model");
const { getEthersProvider } = require("../utils/utils");
const { approveMaxToken } = require("./setting");

const approve = async () => {
  const network = "matic-main";
  const routerAddress = uniswapV3Router;
  const router = await Router.findOne({
    routerContract: routerAddress,
    network: network,
  });

  const provider = getEthersProvider(router.rpc);
  console.log("routerAddress", routerAddress);
  console.log("wethAddress", router.wethAddress);
  await approveMaxToken(provider, routerAddress, router.wethAddress);
};

approve();
