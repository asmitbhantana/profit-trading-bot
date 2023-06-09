require("dotenv").config();
const { BigNumber, utils } = require("ethers");
const { calculateIOAmount, calculateSellAmount } = require("../budget/budget");
const { uniswapV2Router, uniswapV3Router } = require("../contracts/const");
const contract = require("../contracts/contract");
const {
  getERC20Contract,
  getRouterContract,
  getV3RouterContract,
} = require("../contracts/contract");
const {
  updateChangedTokenBalance,
  getAllWalletBalance,
} = require("../database/action");

const { Router, TokenBundle, Configuration } = require("../database/model");
const {
  performBuySaleTransaction,
  performBuySaleTransactionV3,
} = require("../memepool/performTxn");
const { getEthersProvider, precision } = require("../utils/utils");
const {
  decodeInputs,
  code,
  decodeCode,
  method_name,
  isV3Method,
} = require("./uniswapRouter");

//swap for weth
const analyzeV2Transaction = async (
  methodName,
  currentRouterAddress,

  params,
  metadata,
  isConfirmed
) => {
  let currentConfiguration = await Configuration.findOne({}).exec();

  //retrives the router info
  let currentRouterData = await Router.findOne({
    routerContract: currentRouterAddress,
    network: metadata.network,
  }).exec();

  //Provider
  const provider = getEthersProvider(currentRouterData.rpc);

  //Uniswap Router Contract
  const routerContract = getRouterContract(provider, currentRouterAddress);

  let wethAddress = currentRouterData.wethAddress;

  let currentRouter = routerContract;

  let amountIn;
  let amountOutMin;
  let amountOut;
  let amountInMax;
  let path = params.path;
  let value = params.value;
  let isBuy = true;

  if (
    currentConfiguration.untrackedTokens.includes(path[0]) ||
    currentConfiguration.untrackedTokens.includes(path[1])
  ) {
    console.log("restricted tokens encountered", path[0], path[1]);
    console.log("returning");
    return true;
  }

  let walletBalance0 = await getAllWalletBalance(
    path[0],
    currentConfiguration.ourWallet
  );
  let walletBalance1 = await getAllWalletBalance(
    path[path.length - 1],
    currentConfiguration.ourWallet
  );

  let ourBalance0 = await TokenBundle.findOne({
    wallet: currentConfiguration.ourWallet,
    tokenAddress: path[0],
  }).exec();

  if (ourBalance0) ourBalance0 = ourBalance0.balance;
  else ourBalance0 = 0;

  let ourBalance1 = await TokenBundle.findOne({
    wallet: currentConfiguration.ourWallet,
    tokenAddress: path[path.length - 1],
  }).exec();

  if (ourBalance1) ourBalance1 = ourBalance1.balance;
  else ourBalance1 = 0;

  let ratio;

  console.log("Starting Of Method", methodName);

  switch (methodName) {
    //may be buy or sell
    case "swapExactTokensForTokens":
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;

      if (path[path.length - 1] == wethAddress) {
        // sell token
        isBuy = false;

        if (isConfirmed) {
          await updateChangedTokenBalance(metadata.from, path[0], provider);
        } else {
          [amountIn, ratio] = calculateSellAmount(
            walletBalance0,
            amountIn,
            ourBalance0
          );

          await performBuySaleTransaction(
            provider,
            currentRouter,
            path[0],
            path[path.length - 1],
            amountIn,
            BigNumber.from(amountOutMin).div(ratio).mul(precision),
            isBuy,
            false,
            currentConfiguration,
            params,
            metadata
          );
        }
      } else {
        if (isConfirmed) {
          if (path[0] == wethAddress) {
            //buy other token
            await updateChangedTokenBalance(
              metadata.from,
              path[path.length - 1],
              provider
            );
          } else {
            await updateChangedTokenBalance(metadata.from, path[0], provider);
            await updateChangedTokenBalance(
              metadata.from,
              path[path.length - 1],
              provider
            );
          }
        } else {
          if (path[0] == wethAddress) {
            [amountIn, amountOutMin] = calculateIOAmount(
              amountIn,
              amountOutMin,
              BigNumber.from(
                utils.parseEther(currentConfiguration.maximumWeth)
              ),
              BigNumber.from(
                utils.parseEther(currentConfiguration.minimumWeth)
              ),
              BigNumber.from(currentConfiguration.amountPercentage)
            );

            await performBuySaleTransaction(
              provider,
              currentRouter,
              path[0],
              path[path.length - 1],
              amountIn,
              amountOutMin,
              isBuy,
              true,
              currentConfiguration,
              params,
              metadata
            );
          }
        }
      }

      break;
    case "swapTokensForExactTokens":
      amountInMax = params.amountInMax;
      amountOut = params.amountOut;

      if (path[0] == wethAddress) {
        if (isConfirmed) {
          await updateChangedTokenBalance(
            metadata.from,
            path[path.length - 1],
            provider
          );
        }

        [amountInMax, amountOut] = calculateIOAmount(
          amountInMax,
          amountOut,
          BigNumber.from(utils.parseEther(currentConfiguration.maximumWeth)),
          BigNumber.from(utils.parseEther(currentConfiguration.minimumWeth)),
          BigNumber.from(currentConfiguration.amountPercentage)
        );

        //buy
        await performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountInMax,
          amountOut,
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      } // sell token
      else {
        //sale token
        if (path[path.length - 1] == wethAddress) {
          isBuy = false;

          if (isConfirmed) {
            await updateChangedTokenBalance(metadata.from, path[0], provider);
          } else {
            [amountInMax, ratio] = calculateSellAmount(
              walletBalance0,
              amountInMax,
              ourBalance0
            );

            await performBuySaleTransaction(
              provider,
              currentRouter,
              path[0],
              path[path.length - 1],
              amountInMax,
              BigNumber.from(amountOut).div(ratio).mul(precision),
              isBuy,
              false,
              currentConfiguration,
              params,
              metadata
            );
          }
        } else {
          if (isConfirmed) {
            await updateChangedTokenBalance(metadata.from, path[0], provider);
            await updateChangedTokenBalance(
              metadata.from,
              path[path.length - 1],
              provider
            );
          } else {
            await performBuySaleTransaction(
              provider,
              currentRouter,
              path[0],
              path[path.length - 1],
              amountInMax,
              amountOut,
              isBuy,
              false,
              currentConfiguration,
              params,
              metadata
            );
          }
        }
      }

      break;

    //buy
    case "swapExactETHForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
      amountIn = value;
      amountOutMin = params.amountOutMin;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          metadata.from,
          path[path.length - 1],
          provider
        );
      } else {
        [amountIn, amountOutMin] = calculateIOAmount(
          amountIn,
          amountOutMin,
          BigNumber.from(utils.parseEther(currentConfiguration.maximumWeth)),
          BigNumber.from(utils.parseEther(currentConfiguration.minimumWeth)),
          BigNumber.from(currentConfiguration.amountPercentage)
        );

        await performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          amountOutMin,
          isBuy,
          true,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
    case "swapETHForExactTokens":
      amountOut = params.amountOut;
      amountIn = value;
      if (isConfirmed) {
        await updateChangedTokenBalance(
          metadata.from,
          path[path.length - 1],
          provider
        );
      } else {
        [amountIn, amountOut] = calculateIOAmount(
          amountIn,
          amountOut,
          BigNumber.from(utils.parseEther(currentConfiguration.maximumWeth)),
          BigNumber.from(utils.parseEther(currentConfiguration.minimumWeth)),
          BigNumber.from(currentConfiguration.amountPercentage)
        );

        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          amountOut,
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
    //sell
    case "swapExactTokensForETH":
    //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
      //amountIn: exact token amount, amountOutMin:  minimum amount of eth required
      amountIn = params.amountIn;
      amountOutMin = params.amountOutMin;
      isBuy = false;
      if (isConfirmed) {
        await updateChangedTokenBalance(metadata.from, path[0], provider);
      } else {
        console.log("calculated", "amount In", amountIn.toString());
        console.log("our balance 0", ourBalance0.toString());
        [amountIn, ratio] = calculateSellAmount(
          walletBalance0,
          amountIn,
          ourBalance0
        );

        if (amountIn.toString() == "0") return;

        console.log(
          "our amount out ",
          BigNumber.from(amountOutMin).div(ratio).mul(precision).toString()
        );

        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountIn,
          BigNumber.from(amountOutMin).div(ratio).mul(precision),
          isBuy,
          false,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;

    case "swapTokensForExactETH":
      //amountOut: exactTokenAmount,
      // amountInMax: amount of token to be swapped should be smaller than the total
      amountOut = params.amountOut;
      amountInMax = params.amountInMax;
      isBuy = false;
      if (isConfirmed) {
        await updateChangedTokenBalance(metadata.from, path[0], provider);
      } else {
        [amountInMax, ratio] = calculateSellAmount(
          walletBalance0,
          amountInMax,
          ourBalance0
        );
        performBuySaleTransaction(
          provider,
          currentRouter,
          path[0],
          path[path.length - 1],
          amountInMax,
          BigNumber.from(amountOut).div(ratio).mul(precision),
          isBuy,
          true,
          currentConfiguration,
          params,
          metadata
        );
      }

      break;
  }
};

//swap for weth
const analyzeV3Transaction = async (
  subCalls,
  routerAddress,
  arguments,
  metadata,
  isConfirmed
) => {
  //we will get params and every methods
  //make sure we change the multicall from one method to another
  //like creating the multicall such that that call the corresponding
  //from here we need to create the multicall and call them
  //call them using contract functions
  let currentConfiguration = await Configuration.findOne({}).exec();
  //retrives the router info
  let currentRouterData = await Router.findOne({
    routerContract: routerAddress,
    network: metadata.network,
  }).exec();

  console.log("current Router data", routerAddress);
  console.log(metadata.network);

  //Provider
  const provider = getEthersProvider(currentRouterData.rpc);

  let routerContract;
  if (!currentRouterData.isUniversalRouter) {
    console.log("router is not universal router hence");

    routerContract = getV3RouterContract(provider, routerAddress);
  } else {
    console.log("router is universal router hence");
    routerContract = contract.getUniversalRouterContract(
      provider,
      routerAddress
    );
  }

  performBuySaleTransactionV3(
    provider,
    routerContract,
    currentRouterData,
    subCalls,
    currentConfiguration,
    arguments,
    metadata,
    isConfirmed
  );
};

//swap this is for the universal router
const analyzeUniversalRouter = async (
  methodName,
  call_inputs,
  commands,
  routerAddress,
  arguments,
  metadata,
  isConfirmed
) => {
  console.log("methodName", methodName);
  console.log("call_inputs", call_inputs);
  console.log("commands", commands);
  if (methodName == "execute" || methodName == "execute0") {
    //decode and get methods with inputs
    let inputs = [];
    let methods = [];
    let nextIndex = 4;

    for (let i = 2; nextIndex <= commands.length; i = i + 2) {
      let cm = commands.substring(i, nextIndex);
      let code = decodeCode(cm);
      if (code != null) {
        console.log("methods", methods);
        console.log("method_name", method_name[code]);
        methods.push(method_name[code]);
        inputs.push({ input: decodeInputs(code, call_inputs[i / 2 - 1]) });
      }
      nextIndex += 2;
    }

    console.log("methodName", methodName);
    console.log("methods", methods);
    console.log("inputs", inputs);

    let tokens;
    //manage inputs with input decoder
    inputs.forEach((i) => {
      if (typeof i.input[3] == "string") {
        let path = i.input[3];
        let path1 = path.substring(0, 42);
        let path2 = "0x" + path.substring(path.length - 40, path.length);
        tokens = [path1, path2];
      }
    });

    //prepare the transactions
    for (let i = 0; i < methods.length; i++) {
      //check if the method is v3
      if (isV3Method(methods[i])) {
        //is v3
        let param = {};

        if (methods[i] == "exactInputSingle") {
          param = {
            amountIn: inputs[i].input[1],
            amountOutMinimum: inputs[i].input[2],
            path: tokens,
            tokenIn: tokens[0],
            tokenOut: tokens[1],
            to: metadata.from,
          };
        } else if (methods[i] == "exactOutputSingle") {
          param = {
            amountInMaximum: inputs[i].input[1],
            amountOut: inputs[i].input[2],
            path: tokens,
            tokenIn: tokens[1],
            tokenOut: tokens[0],
            to: metadata.from,
          };
        } else if (methods[i] == "swapExactTokensForTokens") {
          param = {
            amountIn: inputs[i].input[1],
            amountOutMinimum: inputs[i].input[2],
            path: tokens,
            tokenIn: inputs[i].input[3][0],
            tokenOut: inputs[i].input[3][1],
            to: metadata.from,
          };
        } else if (methods[i] == "swapTokensForExactTokens") {
          param = {
            amountInMaximum: inputs[i].input[1],
            amountOut: inputs[i].input[2],
            path: tokens,
            tokenIn: inputs[i].input[3][1],
            tokenOut: inputs[i].input[3][0],
            to: metadata.from,
          };
        } else {
          param = {
            amountOut: inputs[i].input[1],
            amountInMaximum: inputs[i].input[2],
            path: tokens,
            tokenIn: inputs[i].input[3][1],
            tokenOut: inputs[i].input[3][0],
            to: metadata.from,
          };
        }
        console.log("param->", param);

        let subcalls = [
          {
            data: {
              methodName: methods[i],
              params: { params: param },
            },
          },
        ];

        analyzeV3Transaction(
          subcalls,
          uniswapV3Router,
          arguments,
          metadata,
          isConfirmed
        );
      } else {
        //is v2
        let param = {};

        if (methods[i] == "swapExactTokensForTokens") {
          param = {
            amountIn: inputs[i].input[1],
            amountOutMinimum: inputs[i].input[2],
            path: tokens,
            tokenIn: inputs[i].input[3][0],
            tokenOut: inputs[i].input[3][1],
            to: metadata.from,
            deadline: BigNumber.from(Math.round(Date.now() / 1000) + 120),
          };
        } else {
          param = {
            amountOut: inputs[i].input[1],
            amountInMaximum: inputs[i].input[2],
            path: tokens.reverse(),
            tokenIn: tokens[1],
            tokenOut: tokens[0],
            to: metadata.from,
            deadline: BigNumber.from(Math.round(Date.now() / 1000) + 120),
          };
        }

        analyzeV2Transaction(
          methods[i],
          uniswapV2Router,
          param,
          metadata,
          isConfirmed
        );
      }
    }
  }
};

module.exports = {
  analyzeV2Transaction,
  analyzeV3Transaction,
  analyzeUniversalRouter,
};
