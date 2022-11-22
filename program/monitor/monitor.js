require('dotenv').config();
const corn = require('node-cron');
const { Configuration } = require('../database/model');
const { BigNumber } = require('ethers');
const { Transaction, Token, TokenBundle } = require('../database/model');
const { performWalletScan } = require('./walletScan');

const {
  performBuyTransaction,
  performTokenApprovalTransaction,
} = require('./../contracts/action');
const { getERC20Contract } = require('../contracts/contract');
const { createUpdateTokens } = require('../database/action');
const {
  performBuySaleTransaction,
  performApprovalTransaction,
} = require('./performTxn');

const TokenResult = {
  address: String,
  name: String,
  decimals: Number,
  symbol: String,
  logoURI: String,
  chain: String,
  network: String,
  amount: String,
};

const USDC = '';

const monitorAndPerformAction = async (provider, contract) => {
  //retives all tokens and wallets
  let currenConfiguration = await Configuration.findOne({}).exec();

  //retive current owner address balance
  let ourBalanceDatas = await TokenBundle.find({
    wallet: currenConfiguration.trackingWallet,
  }).exec();

  //initialize the database structure
  if (!ourBalanceDatas) {
    let ourTokens = await performWalletScan(
      currenConfiguration.trackingWallet,
      currenConfiguration.tokens
    );

    ourTokens.map((element) => {
      let ourBalanceData = new TokenBundle({
        wallet: currenConfiguration.trackingWallet,

        address: element.address,
        name: element.name,
        decimal: element.decimal,
        symbol: element.symbol,
        logoURI: element.logoURI,
        chain: element.chain,
        network: element.network,
        amount: element.amount,
      });
      ourBalanceData.save();
      ourBalanceDatas.push(ourBalanceData);
    });
  }

  //TODO: initialize the

  //get all tokens to track for different wallets
  currenConfiguration.wallets.map(async (wallet) => {
    //retive data from quicknode api
    let currentWalletData = await performWalletScan(
      wallet,
      currenConfiguration.tokens
    );

    //tally changes
    currentWalletData.map(async (data) => {
      //previous balance of the wallet
      const previousBalance = await TokenBundle.findOne({
        wallet: wallet,
        address: data.address,
      }).exec();

      //our current balance of the wallet from DB
      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.trackingWallet,
        address: data.address,
      }).exec();

      console.log('Our Balance    :', ourBalance.symbol, ourBalance.amount);

      //not the stable coins, weth etc.
      if (
        !currenConfiguration.untrackedTokens.includes(
          currentWalletData.address,
          0
        )
      ) {
        //Print
        //Data from database
        console.log(
          'Prev Balance   :',
          previousBalance.symbol,
          previousBalance.amount
        );
        //Data from the current wallet
        console.log('Current Balance:', data.symbol, data.amount);

        const previousBalanceAmount = previousBalance
          ? BigNumber.from(previousBalance.amount)
          : BigNumber.from(0);
        const currentBalanceAmount = data
          ? BigNumber.from(data.amount)
          : BigNumber.from(0);
        const ourBalanceNow = ourBalance
          ? BigNumber.from(ourBalance.amount)
          : BigNumber.from(0);

        //action
        //the user performed buy
        if (previousBalanceAmount.lt(currentBalanceAmount)) {
          console.log(
            'In Buy',
            previousBalanceAmount.toString(),
            '<',
            currentBalanceAmount.toString()
          );
          let percentageChange = BigNumber.from(100);
          if (!previousBalanceAmount.isZero()) {
            percentageChange = currentBalanceAmount
              .sub(previousBalanceAmount)
              .div(previousBalanceAmount);
          }
          console.log('Percentage change', percentageChange.toString());
          //perform buy same
          let amountToBuy = ourBalanceNow.mul(percentageChange);

          //perform the bying of same amount if our balance is 0
          if (ourBalanceNow.isZero()) {
            amountToBuy = currentBalanceAmount;
          }
          console.log('Amount To Buy', amountToBuy.toString());

          //perform buy
          //execute approval of tokens
          console.log(
            '-----> Buying Token ',
            data.symbol,
            'in',
            amountToBuy.toString() + '<----------'
          );

          //buy
          //selling token usdc
          // const buyResult = await performBuySaleTransaction(
          //   provider,
          //   contract,
          //   USDC,
          //   data.address,
          //   amountToBuy,
          //   wallet
          // );

          // if (buyResult.status) {
          //   const performTokenApprovalResult = await performApprovalTransaction(
          //     provider,
          //     data.address,
          //     contract.address,
          //     amountToBuy,
          //     wallet
          //   );
          // } else {
          //   console.log(
          //     'Cannot Buy The Token:',
          //     data.address,
          //     'in',
          //     amountToBuy.toString()
          //   );
        }
      }

      //the user performed sell
      else {
        if (previousBalanceAmount.toString() == currentBalanceAmount.toString())
          return;
        console.log(
          'In Sell',
          previousBalanceAmount.toString(),
          '>',
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
        console.log('Percentage change', percentageChange.toString());

        //peform sell
        let amountToSell = ourBalanceNow.mul(percentageChange);

        if (ourBalanceNow.isZero()) {
          amountToSell = currentBalanceAmount;
        }
        console.log('Amount To Sell', amountToSell.toString());

        console.log(
          '----> Selling Token' +
            data.symbol +
            'in' +
            amountToSell.toString() +
            '<------'
        );

        //   const sellResult = await performBuySaleTransaction(
        //     provider,
        //     contract,
        //     data.address,
        //     USDC,
        //     amountToSell,
        //     wallet
        //   );

        //   if (!sellResult.status) {
        //     console.log(
        //       'Cannot Sell The Token:',
        //       data.address,
        //       amoutToSell.toString()
        //     );
        //   }
        // }

        //update track wallet database
        await createUpdateTokens(wallet, data.address, {
          wallet: wallet,

          address: data.address,
          name: data.name,
          decimal: data.decimal,
          symbol: data.symbol,
          logoURI: data.logoURI,
          chain: data.chain,
          network: data.network,
          amount: data.amount,
        });
      }
    });

    // update
    //update the current data address
    let updatedTokenBalance = await performWalletScan(
      currenConfiguration.trackingWallet,
      currenConfiguration.tokens
    );

    updatedTokenBalance.map(async (token) => {
      await createUpdateTokens(
        currenConfiguration.trackingWallet,
        token.address,
        {
          wallet: currenConfiguration.trackingWallet,

          address: token.address,
          name: token.name,
          decimal: token.decimal,
          symbol: token.symbol,
          logoURI: token.logoURI,
          chain: token.chain,
          network: token.network,
          amount: token.amount,
        }
      );
    });
  });
};

const startWalletMonitor = (provider, contract) => {
  console.log('---------------Start Wallet Monitoring -----------------');
  //runs in every 10 seconds interval
  let task = corn.schedule('*/30 * * * * *', async () => {
    await monitorAndPerformAction(provider, contract);
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
