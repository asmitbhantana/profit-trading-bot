const { BigNumber } = require("ethers");
const {
  createUpdateConfig,
  createUpdateRouter,
  addRouter,
  createUpdateSlippageFee,
} = require("../database/action");
const { performApprovalTransaction } = require("../monitor/performTxn");

const setConfig = async () => {
  let config = {
    maximumWeth: "0.001",
    minimumWeth: "0.0001",
    amountPercentage: "200",
    ourWallet: "0xD114dDe767a972Eb3665840b14F78FaEE3943E80",
    tokens: [
      "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
      "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
      "0x0e239dB593619bcF6248FdeF4723f26cf40e1f37",
      "0xB702124910c880e6E52a1F403d66645155017a4D",
      "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    ],
    wallets: ["0xf8D8bA1F5f592C53eAe8F8d750a6b0F09ca31Cee"],
    untrackedTokens: [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ],
    maxGasLimit: "10000000",
    maxPriorityFee: "3000000000",
  };

  await createUpdateConfig(config);
};

const addNewRouter = async () => {
  const router1 = {
    routerContract: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    routerName: "Uniswap V2: Router",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    network: "80001",
    chainName: "Mumbai Testnet",
  };

  const router2 = {
    routerContract: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    routerName: "Uniswap V2: Router",
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    network: "5",
    chainName: "Goerli",
  };

  await addRouter(router2);
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
