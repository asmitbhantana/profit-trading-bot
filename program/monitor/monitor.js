const corn = require('node-cron');
const { Configuration } = require('../database/model');

const { Transaction, Token, TokenBundle } = require('../database/model');
const { performWalletScan } = require('./walletScan');

//connect to database

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

const monitorAndPerformAction = async () => {
  //retives all tokens and wallets
  let currenConfiguration = await Configuration.find({});
  console.log('Wallets', currenConfiguration.wallets);

  //retive current owner address balance
  let ourBalanceDatas = await TokenBundle.find({
    _id: currenConfiguration.trackingWallet,
  });

  //get all tokens to track for different wallets
  currenConfiguration.wallets.map(async (wallet) => {
    //read previous data from database
    const previousData = await TokenBundle.find({ _id: wallet });

    //retive data from quicknode api
    let currentWalletData = await performWalletScan(
      wallet,
      currenConfiguration.tokens
    );

    //tally changes
    currentWalletData.map(async (data) => {
      const previousBalance = await previousData.find({
        address: data.address,
      });

      const ourBalance = await ourBalanceDatas.find({
        address: data.address,
      });

      //not the stable coins, weth etc
      if (
        !currenConfiguration.untrackedTokens.includes(
          currentWalletData.address,
          0
        ) &&
        previousBalance.amount != 0 &&
        ourBalance.amount != 0
      ) {
        //TODO: check the previous data
        const previousBalanceAmount = BigNumber.from(previousBalance.amount);
        const currentBalanceAmount = BigNumber.from(currentBalance.amount);
        const ourBalance = BigNumber.from(ourBalance.amount);

        //action
        //the user performed buy
        if (currentBalanceAmount.gt(previousBalanceAmount)) {
          const percentageChange = currentBalanceAmount
            .sub(previousBalanceAmount)
            .div(previousBalanceAmount);

          //perform buy same
          const amountToBuy = ourBalance * percentageChange;
          //perform buy
          //buy(currentBalance.address)
          //execute approval of tokens
        }
        //the user performed sell
        else {
          const percentageChange = previousBalanceAmount
            .sub(currentBalanceAmount)
            .div(previousBalanceAmount);

          //peform sell
          const amoutToSell = ourBalance * percentageChange;
        }
      }
    });
    //update the database
    await createUpdateTokens(wallet, currentWalletData);

    //retive the data from
  });

  //retrive data from API
  // const tokens = await performWalletScan(
  //   '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  // );

  // console.log(tokens);
};

const startWalletMonitor = () => {
  console.log('---------------Start Wallet Monitoring -----------------');
  //runs in every 10 seconds interval
  let task = corn.schedule('*/2 * * * * *', () => {
    monitorAndPerformAction();
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
