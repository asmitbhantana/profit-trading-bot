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
  let ourBalanceDatas = await TokenBundle.findByWallet(
    currenConfiguration.trackingWallet
  ).exec();

  ourBalanceDatas = ourBalanceDatas[0];

  if (!ourBalanceDatas) {
    //datas not available on the database hence
    //first time so enter

    const ourTokens = await performWalletScan(
      currenConfiguration.trackingWallet,
      currenConfiguration.tokens
    );

    ourBalanceDatas = new TokenBundle({
      wallet: currenConfiguration.trackingWallet,
      tokens: [ourTokens],
    });
  }

  //get all tokens to track for different wallets
  currenConfiguration.wallets.map(async (wallet) => {
    console.log('Scanning For Wallet ' + wallet);
    //retive data from quicknode api
    let currentWalletData = await performWalletScan(
      wallet,
      currenConfiguration.tokens
    );
    //tally changes
    currentWalletData.map(async (data) => {
      const previousBalance = await TokenBundle.findOne({
        wallet: wallet,
        tokens: { address: data.address },
      }).exec();

      const ourBalance = await TokenBundle.findOne({
        wallet: currenConfiguration.trackingWallet,
        tokens: { address: data.address },
      }).exec();

      //not the stable coins, weth etc
      if (
        !currenConfiguration.untrackedTokens.includes(
          currentWalletData.address,
          0
        )
      ) {
        //TODO: check the previous data
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
          let percentageChange = BigNumber.from(100);
          if (!previousBalanceAmount.isZero()) {
            percentageChange = currentBalanceAmount
              .sub(previousBalanceAmount)
              .div(previousBalanceAmount);
          }

          //perform buy same
          let amountToBuy = ourBalanceNow.mul(percentageChange);
          // FIX:
          if (ourBalanceNow.isZero()) {
            amountToBuy = currentBalanceAmount;
          }
          //perform buy
          //buy(currentBalance.address)
          //execute approval of tokens
          console.log(
            'Buying Token ',
            data.address,
            'in',
            amountToBuy.toString()
          );
          //buy
          //selling token usdc
          // const buyResult = await performBuyTransaction(
          //   contract,
          //   USDC,
          //   data.address,
          //   amountToBuy,
          //   0,
          //   wallet
          // );

          // let nonce = await httpsProvider.getTransactionCount(address);
          // let feeData = await httpsProvider.getFeeData();
          // let param = {
          //   type: 2,
          //   nonce: nonce,
          //   to: contract.address,
          //   maxPriorityFeePe: feeData['maxPriorityFeePerGas'],
          //   maxFeePerGas: feeData['maxFeePerGas'],
          //   gasLimit: 100000, //TODO: make this variable
          //   chainId: process.env.NETWORK_ID,
          // };
          // if (buyResult.status) {
          //   const performTokenApprovalResult =
          //     await performTokenApprovalTransaction(
          //       getERC20Contract(data.address),
          //       contract.address,
          //       amountToBuy,
          //       param
          //     );
          // } else {
          //   console.log(
          //     'Cannot Buy The Token:',
          //     data.address,
          //     'in',
          //     amountToBuy.toString()
          //   );
          // }
        }

        //the user performed sell
        else {
          let percentageChange = 100;
          if (!previousBalanceAmount.isZero()) {
            percentageChange = previousBalanceAmount
              .sub(currentBalanceAmount)
              .div(previousBalanceAmount);
          }

          //peform sell
          let amoutToSell = ourBalanceNow.mul(percentageChange);
          if (!amoutToSell.isZero()) {
            console.log(
              'Selling Token ' + data.address + ' in ' + amoutToSell.toString()
            );
            // const sellResult = await performBuyTransaction(
            //   contract,
            //   data.address,
            //   USDC,
            //   amountToBuy,
            //   0,
            //   wallet,
            //   param
            // );

            // if (!sellResult.status) {
            //   console.log(
            //     'Cannot Sell The Token:',
            //     data.address,
            //     amoutToSell.toString()
            //   );
            // }
          } else {
            console.log('Selling Token:' + data.address + ' in 0');
          }
        }
      }
    });
    //update user with the database
    let updatedData = await createUpdateTokens(wallet, {
      wallet: wallet,
      tokens: currentWalletData,
    });

    await createUpdateTokens(currenConfiguration.trackingWallet, {
      wallet: currenConfiguration.trackingWallet,
      tokens: currentWalletData,
    });
    // console.log('Updated Token:', updatedData);
    // update
  });

  //retrive data from API
  // const tokens = await performWalletScan(
  //   '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  // );

  // console.log(tokens);
};

const startWalletMonitor = (provider, contract) => {
  console.log('---------------Start Wallet Monitoring -----------------');
  //runs in every 10 seconds interval
  let task = corn.schedule('*/15 * * * * *', () => {
    monitorAndPerformAction(provider, contract);
  });

  task.start();
};

module.exports = {
  startWalletMonitor: startWalletMonitor,
};
