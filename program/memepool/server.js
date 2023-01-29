const express = require('express');
const { isTrackingwallet } = require('../database/action');
const { Router } = require('../database/model');
const {
  analyzeV2Transaction,
  analyzeV3Transaction,
  analyzeUniversalRouter,
} = require('./anaylizeTransaction');

//connect to the database
require('../database/connection');

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const port = 4000;

app.post('/*', async (req, res) => {
  const txnData = req.body;
  if (
    (txnData.status == 'pending' || txnData.status == 'confirmed') &&
    isTrackingwallet(txnData.from)
  ) {
    const isConfirmed = txnData.status == 'confirmed';
    const contractCall = txnData;
    const contractCallData = txnData.contractCall;
    let currentRouter = await Router.findOne({
      routerContract: contractCallData.contractAddress,
    }).exec();

    console.log('current router', contractCallData.contractAddress);

    if (!currentRouter) return res.json({ unsuccess: 'no-current-router' });

    let routerAddress = contractCallData.contractAddress;

    let metadata = {
      network: contractCall.network,
      from: contractCall.from,
      to: contractCall.to,
      value: contractCall.value,
      gasLimit: contractCall.gas,
    };
    let params = {
      ...contractCallData.params,
      value: contractCall.value,
    };

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
      let methodName = contractCallData.params.methodName;

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

    res.json({ success: 'txn performing' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
