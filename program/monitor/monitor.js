require("dotenv").config();
const corn = require("node-cron");
const { Configuration } = require("../database/model");
const { BigNumber } = require("ethers");
const { Transaction, Token, TokenBundle } = require("../database/model");
const { performWalletScan } = require("./walletScan");

const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require("./../contracts/action");
const { getERC20Contract } = require("../contracts/contract");
const { createUpdateTokens } = require("../database/action");
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require("./performTxn");

const USDC = "0x60450439A3d91958E9Dae0918FC4e0d59a77f896";

const monitorAndPerformAction = async (chains, provider, contract) => {
  //retives all tokens and wallets
  let currenConfiguration = await Configuration.findOne({}).exec();

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

    ourTokens.map(async (element) => {
      let ourBalanceData = new TokenBundle({
        wallet: currenConfiguration.ourWallet,

        token_address: element.token_address,
        name: element.name,
        decimal: element.decimals,
        symbol: element.symbol,
        logoURI: element.logoURI,
        chain: chains.name,
        balance: element.balance,
      });
      await ourBalanceData.save();
      ourBalanceDatas.push(ourBalanceData);
    });
  }

  //TODO: initialize the

  //get all tokens to track for different wallets
  currenConfiguration.wallets.map(async (wallet) => {
    //retive data from quicknode api
    let currentWalletData = await performWalletScan(chains, wallet);

    //tally changes
    currentWalletData.map(async (data) => {
      //previous balance of the wallet
      const previousBalance = await TokenBundle.findOne({
        wallet: wallet,
        token_address: data.token_address,
      }).exec();

      //no previous balance hence add this to the database
      if (previousBalance == null) {
        // update
        //update the current data address
        let updatedTokenBalance = await performWalletScan(chains, wallet);

        updatedTokenBalance.map(async (token) => {
          await createUpdateTokens(wallet, token.token_address, {
            wallet: wallet,

            token_address: token.token_address,
            name: token.name,
            decimal: token.decimal,
            symbol: token.symbol,
            logoURI: token.logoURI,
            chain: chains.name,
            balance: token.balance,
          });
        });
        return;
      }
      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.ourWallet,
        token_address: data.token_address,
      }).exec();
      console.log("Our Balance    :", ourBalance.symbol, ourBalance.balance);

      //not the stable coins, weth etc.
      if (
        !currenConfiguration.untrackedTokens.includes(data.token_address, 0)
      ) {
        //Print
        //Data from database
        console.log(
          "Prev Balance   :",
          previousBalance.symbol,
          previousBalance.balance
        );
        //Data from the current wallet
        console.log("Current Balance:", data.symbol, data.balance);

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
          console.log(
            "In Buy",
            previousBalanceAmount.toString(),
            "<",
            currentBalanceAmount.toString()
          );
          let percentageChange = BigNumber.from(100);
          if (!previousBalanceAmount.isZero()) {
            percentageChange = currentBalanceAmount
              .sub(previousBalanceAmount)
              .div(previousBalanceAmount);
          }
          console.log("Percentage change", percentageChange.toString());
          //perform buy same
          let amountToBuy = ourBalanceNow.mul(percentageChange);

          //perform the bying of same amount if our balance is 0
          if (ourBalanceNow.isZero()) {
            amountToBuy = currentBalanceAmount;
          }
          console.log("Amount To Buy", amountToBuy.toString());

          //perform buy
          //execute approval of tokens
          console.log(
            "-----> Buying Token ",
            data.symbol,
            "in",
            amountToBuy.toString() + "<----------"
          );

          //buy
          //selling token usdc
          const buyResult = await performBuySaleTransaction(
            provider,
            contract,
            USDC,
            data.token_address,
            amountToBuy,
            wallet
          );

          if (buyResult.status) {
            const performTokenApprovalResult = await performApprovalTransaction(
              provider,
              data.token_address,
              contract.address,
              amountToBuy,
              wallet
            );
          } else {
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
          console.log(
            "In Sell",
            previousBalanceAmount.toString(),
            ">",
            currentBalanceAmount.toString()
          );

          let percentageChange = 100;
          if (!previousBalanceAmount.isZero()) {
            percentageChange = previousBalanceAmount
              .sub(currentBalanceAmount)
              .div(previousBalanceAmount);
            percentageChange == 0
              ? (percentageChange = BigNumber.from(100))
              : BigNumber.from(percentageChange);
          }
          console.log("Percentage change", percentageChange.toString());

          //peform sell
          let amountToSell = ourBalanceNow.mul(percentageChange);

          if (ourBalanceNow.isZero()) {
            amountToSell = currentBalanceAmount;
          }
          console.log("Amount To Sell", amountToSell.toString());

          console.log(
            "----> Selling Token" +
              data.symbol +
              "in" +
              amountToSell.toString() +
              "<------"
          );

          const sellResult = await performBuySaleTransaction(
            provider,
            contract,
            data.token_address,
            USDC,
            amountToSell,
            wallet
          );

          if (!sellResult.status) {
            console.log(
              "Cannot Sell The Token:",
              data.token_address,
              amoutToSell.toString()
            );
          }
        }

        //update track wallet database
        await createUpdateTokens(wallet, data.token_address, {
          wallet: wallet,

          token_address: data.token_address,
          name: data.name,
          decimal: data.decimals,
          symbol: data.symbol,
          logoURI: data.logoURI,
          chain: chains.name,
          network: data.network,
          balance: data.balance,
        });
      }
    });

    // update
    //update the current data address
    let updatedTokenBalance = await performWalletScan(
      chains,
      currenConfiguration.ourWallet
    );

    updatedTokenBalance.map(async (token) => {
      await createUpdateTokens(
        currenConfiguration.ourWallet,
        token.token_address,
        {
          wallet: currenConfiguration.ourWallet,

          token_address: token.token_address,
          name: token.name,
          decimal: token.decimal,
          symbol: token.symbol,
          logoURI: token.logoURI,
          chain: chains.name,
          balance: token.balance,
        }
      );
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
  //runs in every 10 seconds interval
  let task = corn.schedule("*/30 * * * * *", async () => {
    await monitorAndPerformAction(chains, provider, contract);
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
