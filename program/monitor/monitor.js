require("dotenv").config();
const corn = require("node-cron");
const { Configuration, Router, TransactionPool } = require("../database/model");
const { BigNumber } = require("ethers");
const { TokenBundle } = require("../database/model");
const { performWalletScan } = require("./walletScan");
const async = require("async");
const { getAddress } = require("ethers/lib/utils");

const {
  createUpdateTokens,
  updateTokenBalance,
  getAllWalletBalance,
} = require("../database/action");
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require("./performTxn");

const monitorAndPerformAction = async (chains, provider, contract) => {
  //retives all tokens and wallets
  let currenConfiguration = await Configuration.findOne({}).exec();

  console.log("contract address", contract.address);
  //retrives the router info
  let currentRouter = await Router.findOne({
    routerContract: contract.address,
  }).exec();

  //retive current owner address balance
  let ourBalanceDatas = await TokenBundle.find({
    wallet: currenConfiguration.ourWallet,
  }).exec(); //if everything is empty

  let brandNew = false;

  let allBalance = await TokenBundle.find({}).exec();
  if (allBalance.length == 0) {
    brandNew = true;
  }

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

          tokenAddress: element.token_address,
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

    const totalTokenBundle = await TokenBundle.find({ wallet: wallet }).exec();
    //adding the total token bundle which is all sold
    let additionalTokenBundle = [];
    console.log("currentWalletData: ", currentWalletData);
    totalTokenBundle.map((token) => {
      let exclude = true;
      for (let i = 0; i < currentWalletData.length && exclude; i++) {
        if (
          currentWalletData[i].token_address.toLowerCase() ==
          token.tokenAddress.toLowerCase()
        ) {
          exclude = false;
        }
      }
      if (exclude) {
        additionalTokenBundle.push({
          ...token._doc,
          token_address: token.tokenAddress,
          balance: "0",
        });
      }
    });
    currentWalletData = currentWalletData.concat(additionalTokenBundle);
    console.log("data", wallet);
    console.log("current wallet data: ", currentWalletData);

    // return;
    //tally changes
    currentWalletData.map(async (data) => {
      //get total balance in our wallet that we are tracking
      const totalBalanceNow = await getAllWalletBalance(
        data.token_address,
        currenConfiguration.ourWallet
      );

      //previous balance of the wallet
      const previousBalance = await TokenBundle.findOne({
        wallet: wallet,
        tokenAddress: data.token_address,
      }).exec();

      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        tokenAddress: data.token_address,
      }).exec();

      if (brandNew) {
        //just update track wallet database
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
        return;
      }

      console.log("current router", currentRouter);
      //not the stable coins, weth etc.
      if (
        !currenConfiguration.untrackedTokens.includes(data.token_address, 0) &&
        currentRouter.wethAddress.toLowerCase() !=
          data.token_address.toLowerCase()
      ) {
        const previousBalanceAmount = previousBalance
          ? BigNumber.from(previousBalance.balance)
          : BigNumber.from(0);
        const currentBalanceAmount = data.balance
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
            let change = currentBalanceAmount.sub(previousBalanceAmount);

            if (totalBalanceNow.toString() != "0") {
              percentageChange = totalBalanceNow
                .sub(change)
                .mul(BigNumber.from(100))
                .div(totalBalanceNow);
            }
            {
              percentageChange = BigNumber.from("100");
            }

            amountToBuy = ourBalanceNow.mul(percentageChange).div(100);
            console.log("Amount to buy", amountToBuy.toString());
          }
          console.log("Buy Percentage change", percentageChange.toString());
          console.log("Amount To Buy", amountToBuy.toString());
          console.log("Our Balance Now", ourBalanceNow.toString());

          if (amountToBuy.isZero()) return;

          //perform the buying of change amount if our balance is 0
          if (ourBalanceNow.isZero()) {
            amountToBuy = currentBalanceAmount.sub(previousBalanceAmount);
          }

          //buy
          //selling token
          const buyResult = await performBuySaleTransaction(
            provider,
            contract,
            currentRouter.wethAddress,
            data.token_address,
            amountToBuy,
            currenConfiguration,
            true,
            currentRouter.isV3,

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
              console.log(buyResult.amountOut);
              const newBalance = ourBalanceNow.add(buyResult.amountOut);
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
          } else {
            //failed to buy
            console.log(
              "Cannot Buy The Token:",
              data.token_address,
              "in",
              amountToBuy.toString()
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
            balance: data.balance ? data.balance : "0",
          });
        }

        //the user performed sell
        else {
          //done nothing
          if (
            previousBalanceAmount.toString() == currentBalanceAmount.toString()
          ) {
            return;
          }

          let percentageChange = BigNumber.from(100);
          let amountToSell = previousBalanceAmount.sub(currentBalanceAmount);
          if (!previousBalanceAmount.isZero()) {
            let change = previousBalanceAmount.sub(currentBalanceAmount);

            totalBalanceNow.toString() == "0"
              ? (percentageChange = BigNumber.from(0))
              : (percentageChange = totalBalanceNow
                  .sub(change)
                  .mul(BigNumber.from(100))
                  .div(totalBalanceNow));

            percentageChange == 0
              ? (percentageChange = BigNumber.from(100))
              : BigNumber.from(percentageChange);

            if (percentageChange.lt(BigNumber.from(0)))
              percentageChange = BigNumber.from(100);
            amountToSell = ourBalanceNow.mul(percentageChange).div(100);
          }
          console.log("Sell Percentage change", percentageChange.toString());

          //perform sell
          if (ourBalance == null || ourBalanceNow.isZero()) {
            console.log("dry updating the tokens", wallet, data.token_address);
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
            return;
          }

          //sell all our tokens if the percentage change amount is greater than our balance
          if (amountToSell.gt(ourBalanceNow)) amountToSell = ourBalanceNow;

          const sellResult = await performBuySaleTransaction(
            provider,
            contract,
            data.token_address,
            currentRouter.wethAddress,
            amountToSell,
            currenConfiguration,
            false,
            currentRouter.isV3,

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
          } else {
            console.log(
              "Cannot Sell The Token:",
              data.token_address,
              amountToSell.toString()
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
  let task = corn.schedule("1 * * * * *", () => {
    monitorAndPerformAction(chains, provider, contract);
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
