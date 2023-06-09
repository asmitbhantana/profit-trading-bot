const express = require('express');
const {
  isTrackingwallet,
  createNewTransaction,
  updateTransaction,
  havePrevTransaction,
} = require('../database/action');
const { Router } = require('../database/model');
const {
  analyzeV2Transaction,
  analyzeV3Transaction,
  analyzeUniversalRouter,
} = require('./anaylizeTransaction');

const path = require('path');
const { BigNumber } = require('ethers');

//connect to the database
require('../database/connection');

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const port = 80;

const callRouter = async (req, res) => {
  let isSmart = false;
  const txnData = req.body;
  try {
    if (
      (txnData.status == 'pending' ||
        txnData.status == 'confirmed' ||
        txnData.status == 'failed') &&
      isTrackingwallet(txnData.from)
    ) {
      //if there is no previous txn and only confirmed
      const doesnotHasPrevPendingTxn = await havePrevTransaction(txnData.hash);
      if (
        doesnotHasPrevPendingTxn &&
        (txnData.status == 'confirmed' || txnData.status == 'failed')
      ) {
        isSmart = true;
        console.log('smart :) no pending txn, ', txnData.hash);
        txnData.status = 'pending';
      }
      const isConfirmed = txnData.status == 'confirmed';

      const contractCall = txnData;
      const contractCallData = txnData.contractCall;
      let currentRouter = await Router.findOne({
        routerContract: contractCall.to,
      }).exec();

      if (!currentRouter) {
        console.log('Current router failed', txnData);
        return res.json({ unsuccess: 'no-current-router' });
      }

      console.log('Current router succeed', txnData);

      let routerAddress = contractCall.to;
      console.log('current router', routerAddress);

      let metadata = {
        txnHash: txnData.hash,
        network: contractCall.network,
        from: contractCall.from,
        to: contractCall.to,
        value: contractCall.value,
        gasLimit: txnData.gas,
        isConfirmed: txnData.status == 'confirmed',
        maxFeePerGas: Number(
          txnData.maxFeePerGas == '' ||
            txnData.maxFeePerGas == NaN ||
            txnData.maxFeePerGas == undefined
            ? 0
            : txnData.maxFeePerGas
        ),
        maxPriorityFeePerGas: Number(
          txnData.maxFeePerGas == '' ||
            txnData.maxFeePerGas == NaN ||
            txnData.maxFeePerGas == undefined
            ? 0
            : txnData.maxPriorityFeePerGas
        ),
        gasUsed: txnData.status == 'confirmed' ? txnData.gasUsed : 0,
        gasFee:
          txnData.status == 'confirmed' &&
          txnData.baseFeePerGas != NaN &&
          txnData.baseFeePerGas != undefined &&
          txnData.maxPriorityFeePerGas != NaN &&
          txnData.maxPriorityFeePerGas != undefined
            ? BigNumber.from(txnData.baseFeePerGas).add(
                BigNumber.from(txnData.maxPriorityFeePerGas)
              )
            : BigNumber.from('0'),
      };
      let params = {
        ...contractCallData.params,
        value: contractCall.value,
      };

      if (txnData.status != 'failed') {
        if (currentRouter.isV3) {
          let subCalls = contractCallData.subCalls;
          analyzeV3Transaction(
            subCalls,
            routerAddress,
            params,
            metadata,
            isConfirmed
          );
        } else if (currentRouter.isUniversalRouter) {
          //check if it is universal router
          let inputs = contractCallData.params.inputs;
          let commands = contractCallData.params.commands;
          let methodName = contractCallData.methodName;

          console.log('inside of router');
          analyzeUniversalRouter(
            methodName,
            inputs,
            commands,
            routerAddress,
            params,
            metadata,
            isConfirmed
          );
        } else {
          let methodName = contractCallData.methodName;
          analyzeV2Transaction(
            methodName,
            routerAddress,
            params,
            metadata,
            isConfirmed
          );
        }
      }

      if (isSmart) {
        //recall the router for updates
        callRouter(req, res);
      }

      //Save Transaction
      await updateTransaction(metadata.txnHash, {
        targetTimeStamp: txnData.blockTimeStamp,
        targetWallet: metadata.from,
        targetTransactionResult: txnData.status,
        targetMaxGwei: txnData.maxFeePerGas,
        targetMaxPriorityGwei: txnData.maxPriorityFeePerGas,
        targetGasLimit: txnData.gas,
        flowType: 'MempoolTransaction',
      });

      res.json({ success: 'txn performing' });
    }
  } catch (err) {
    console.log('error occured', err);
  }
};

app.post('/*', callRouter);

app.use('/output', express.static(path.join(__dirname, '../../output/')));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
