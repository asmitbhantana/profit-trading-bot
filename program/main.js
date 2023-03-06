require("dotenv").config();
const { startWalletMonitor } = require("./monitor/monitor");
const { EvmChain } = require("@moralisweb3/evm-utils");

//connect to the database
require("./database/connection");

const { getEthersProvider } = require("./utils/utils");
const {
  getRouterContract,
  getV3RouterContract,
} = require("./contracts/contract");
const { uniswapV2Router, uniswapV3Router } = require("./contracts/const");
const {
  setConfig,
  addRouter,
  addNewRouter,
  addTokenSlippageFee,
  approveMaxToken,
} = require("./setting/setting");

const { BigNumber } = require("ethers");

//Provider
const provider = getEthersProvider(process.env.RPC);

//Uniswap Router Contract
const routerContract =
  process.env.UNI_VERSION == "2"
    ? getRouterContract(provider, process.env.ROUTER)
    : getV3RouterContract(provider, process.env.ROUTER);

//chain params to set
let chainParam;

switch (process.env.CHAIN) {
  case "Goerli":
    chainParam = EvmChain.GOERLI;
    break;
  case "Mainnet":
    chainParam = EvmChain.ETHEREUM;
    break;

  case "BSC":
    chainParam = EvmChain.BSC;
    break;

  case "Polygon":
    chainParam = EvmChain.POLYGON;
    break;
}

startWalletMonitor(chainParam, provider, routerContract);
