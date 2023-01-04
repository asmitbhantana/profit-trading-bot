require("dotenv").config();
const corn = require("node-cron");
const { Configuration, Router, TransactionPool } = require("../database/model");
const { BigNumber } = require("ethers");
const { TokenBundle } = require("../database/model");
const { performWalletScan } = require("./walletScan");
const async = require("async");

const {
  createUpdateTokens,
  updateTokenBalance,
} = require("../database/action");
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require("./performTxn");

const monitorAndPerformAction = async (chains, provider, contract) => {
  //retives all tokens and wallets
  let currenConfiguration = await Configuration.findOne({}).exec();

  //retrives the router info
  let currentRouter = await Router.findOne({
    routerContract: contract.address,
  }).exec();

  //retive current owner address balance
  let ourBalanceDatas = await TokenBundle.find({
    wallet: currenConfiguration.ourWallet,
  }).exec();

  //initialize the database structure
  if (ourBalanceDatas.length == 0) {
    let ourTokens = await performWalletScan(
      chains,
      currenConfiguration.ourWallet
    );

    Promise.all(
      ourTokens.map(async (element) => {
        let ourBalanceData = new TokenBundle({
          wallet: currenConfiguration.ourWallet,

          tokenAddress: element.tokenAddress,
          name: element.name,
          decimal: element.decimals,
          symbol: element.symbol,
          logoURI: element.logoURI,
          chain: chains.name,
          balance: element.balance,
        });
        await ourBalanceData.save();
        ourBalanceDatas.push(ourBalanceData);
      })
    );
  }

  //get all tokens to track for different wallets
  currenConfiguration.wallets.map(async (wallet) => {
    //retive data from moralis api
    let currentWalletData = await performWalletScan(chains, wallet);
    console.log("1 Tracking Wallet", wallet);

    //tally changes
    currentWalletData.map(async (data) => {
      //previous balance of the wallet
      const previousBalance = await TokenBundle.findOne({
        wallet: wallet,
        tokenAddress: data.token_address,
      }).exec();

      //no previous balance hence add this to the database
      console.log("2 Tracking Wallet", wallet, data.symbol);

      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        tokenAddress: data.token_address,
      }).exec();

      //not the stable coins, weth etc.
      if (
        !currenConfiguration.untrackedTokens.includes(data.token_address, 0) &&
        currentRouter.wethAddress.toLowerCase() !=
          data.token_address.toLowerCase()
      ) {
        console.log("3 Tracking Wallet", wallet, data.symbol);

        // ourBalance
        //   ? console.log(
        //       "-----------\nOur Balance    :",
        //       ourBalance.symbol,
        //       ourBalance.balance
        //     )
        //   : console.log("-----------\nOur Balance:    XXX 0");

        // //Print
        // //Data from database
        // console.log(
        //   "Prev Balance   :",
        //   previousBalance.symbol,
        //   previousBalance.balance
        // );

        // // Data from the current wallet
        // console.log(
        //   "Current Balance:",
        //   data.symbol,
        //   data.balance,
        //   "\n ----------"
        // );

        const previousBalanceAmount = previousBalance
          ? BigNumber.from(previousBalance.balance)
          : BigNumber.from(0);
        const currentBalanceAmount = data
          ? BigNumber.from(data.balance)
          : BigNumber.from(0);
        const ourBalanceNow = ourBalance
          ? BigNumber.from(ourBalance.balance)
          : BigNumber.from(0);

        //action
        //the user performed buy
        if (previousBalanceAmount.lt(currentBalanceAmount)) {
          let percentageChange = BigNumber.from(100);
          let amountToBuy = currentBalanceAmount.sub(previousBalanceAmount);

          if (!previousBalanceAmount.isZero() && ourBalance != null) {
            percentageChange = currentBalanceAmount
              .sub(previousBalanceAmount)
              .mul(BigNumber.from(100))
              .div(previousBalanceAmount);
            amountToBuy = ourBalanceNow.mul(percentageChange).div(100);
          }
          console.log("Buy Percentage change", percentageChange.toString());
          console.log("Amount To Buy", amountToBuy.toString());
          console.log("Our Balance Now", ourBalanceNow.toString());

          if (amountToBuy.isZero()) return;
          //perform buy same

          //perform the buying of change amount if our balance is 0
          if (ourBalanceNow.isZero()) {
            amountToBuy = currentBalanceAmount.sub(previousBalanceAmount);
          }

          //buy
          //selling token usdc
          const buyResult = await performBuySaleTransaction(
            provider,
            contract,
            currentRouter.wethAddress,
            data.token_address,
            amountToBuy,
            currenConfiguration.ourWallet,
            true,
            currentRouter.isV3,

            currenConfiguration.maxGasLimit,

            {
              targetWallet: wallet,
              tokenAddress: data.token_address,
              previousBalance: previousBalanceAmount.toString(),
              newBalance: currentBalanceAmount.toString(),
            }
          );
          if (buyResult.status == "pending") return;

          //perform buy
          //execute approval of tokens
          console.log(
            "-----> Buying Token ",
            data.symbol,
            "in",
            amountToBuy.toString() + "<----------"
          );

          console.log("Buy Result", buyResult);

          if (buyResult.status) {
            console.log("Approving Tokens", data.symbol);
            const performTokenApprovalResult = await performApprovalTransaction(
              provider,
              data.token_address,
              contract.address,
              amountToBuy
            );

            //update our wallet amount on database
            if (ourBalance) {
              const newBalance = ourBalanceNow.add(amountToBuy);
              await updateTokenBalance(
                currenConfiguration.ourWallet,
                data.token_address,
                newBalance.toString()
              );
            } else {
              await createUpdateTokens(
                currenConfiguration.ourWallet,
                data.token_address,
                {
                  wallet: currenConfiguration.ourWallet,
                  tokenAddress: data.token_address,
                  name: data.name,
                  decimal: data.decimals,
                  symbol: data.symbol,
                  logoURI: data.logoURI,
                  chain: chains.name,
                  network: data.network,
                  balance: amountToBuy.toString(),
                }
              );
            }
            //update track wallet database
            await createUpdateTokens(wallet, data.token_address, {
              wallet: wallet,

              tokenAddress: data.token_address,
              name: data.name,
              decimal: data.decimals,
              symbol: data.symbol,
              logoURI: data.logoURI,
              chain: chains.name,
              network: data.network,
              balance: data.balance,
            });
          } else {
            //failed to buy
            console.log(
              "Cannot Buy The Token:",
              data.token_address,
              "in",
              amountToBuy.toString()
            );
          }
        }

        //the user performed sell
        else {
          if (
            previousBalanceAmount.toString() == currentBalanceAmount.toString()
          )
            return;

          let percentageChange = BigNumber.from(100);
          let amountToSell = previousBalanceAmount.sub(currentBalanceAmount);
          if (!previousBalanceAmount.isZero()) {
            percentageChange = previousBalanceAmount
              .sub(currentBalanceAmount)
              .mul(BigNumber.from(100))
              .div(previousBalanceAmount);
            percentageChange == 0
              ? (percentageChange = BigNumber.from(100))
              : BigNumber.from(percentageChange);

            amountToSell = ourBalanceNow.mul(percentageChange).div(100);
          }
          console.log("Sell Percentage change", percentageChange.toString());

          if (ourBalance == null) return;

          //perform sell

          if (ourBalanceNow.isZero()) return;

          //sell all our tokens if the percentage change amountis greater than our balance
          if (amountToSell.gt(ourBalanceNow)) amountToSell = ourBalanceNow;

          const sellResult = await performBuySaleTransaction(
            provider,
            contract,
            data.token_address,
            currentRouter.wethAddress,
            amountToSell,
            currenConfiguration.ourWallet,
            false,
            currentRouter.isV3,

            currenConfiguration.maxGasLimit,

            {
              targetWallet: wallet,
              tokenAddress: data.token_address,
              previousBalance: previousBalanceAmount.toString(),
              newBalance: currentBalanceAmount.toString(),
            }
          );

          if (sellResult.status == "pending") return;
          console.log(
            "----> Selling Token " +
              data.symbol +
              " in " +
              amountToSell.toString() +
              "<------"
          );
          //update our wallet amount on database
          if (sellResult.status) {
            if (ourBalance) {
              const newBalance = ourBalanceNow.sub(amountToSell);

              await updateTokenBalance(
                currenConfiguration.ourWallet,
                data.token_address,
                newBalance.toString()
              );
            } else {
              await createUpdateTokens(
                currenConfiguration.ourWallet,
                data.token_address,
                {
                  wallet: currenConfiguration.ourWallet,
                  tokenAddress: data.token_address,
                  name: data.name,
                  decimal: data.decimals,
                  symbol: data.symbol,
                  logoURI: data.logoURI,
                  chain: chains.name,
                  network: data.network,
                  balance: amountToSell.toString(),
                }
              );
            }

            //update track wallet database
            await createUpdateTokens(wallet, data.token_address, {
              wallet: wallet,

              tokenAddress: data.token_address,
              name: data.name,
              decimal: data.decimals,
              symbol: data.symbol,
              logoURI: data.logoURI,
              chain: chains.name,
              network: data.network,
              balance: data.balance,
            });
          } else {
            console.log(
              "Cannot Sell The Token:",
              data.token_address,
              amountToSell.toString()
            );
          }
        }
      }
    });
  });
};

const startWalletMonitor = async (chains, provider, contract) => {
  const Moralis = require("moralis").default;
  const MORALIS_API = process.env.MORALIS_API;
  await Moralis.start({
    apiKey: MORALIS_API,
  });
  console.log("---------------Start Wallet Monitoring -----------------");
  //runs in every 1 minutes interval
  let task = corn.schedule("*/10 * * * * *", () => {
    monitorAndPerformAction(chains, provider, contract);
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
