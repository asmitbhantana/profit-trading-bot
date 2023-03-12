const express = require("express");
const {
  isTrackingwallet,
  createNewTransaction,
  updateTransaction,
} = require("../database/action");
const { Router } = require("../database/model");
const {
  analyzeV2Transaction,
  analyzeV3Transaction,
  analyzeUniversalRouter,
} = require("./anaylizeTransaction");

const path = require("path");

//connect to the database
require("../database/connection");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const port = 80;

app.post("/*", async (req, res) => {
  const txnData = req.body;
  try {
    if (
      (txnData.status == "pending" ||
        txnData.status == "confirmed" ||
        txnData.status == "failed") &&
      isTrackingwallet(txnData.from)
    ) {
      const isConfirmed = txnData.status == "confirmed";
      const contractCall = txnData;
      const contractCallData = txnData.contractCall;
      let currentRouter = await Router.findOne({
        routerContract: contractCallData.contractAddress,
      }).exec();

      console.log("current router", contractCallData.contractAddress);

      if (!currentRouter) return res.json({ unsuccess: "no-current-router" });

      let routerAddress = contractCallData.contractAddress;

      let metadata = {
        txnHash: txnData.hash,
        network: contractCall.network,
        from: contractCall.from,
        to: contractCall.to,
        value: contractCall.value,
        gasLimit: txnData.gas,
        isConfirmed: txnData.status == "confirmed",
        maxFeePerGas: Number(txnData.maxFeePerGas),
        maxPriorityFeePerGas: Number(txnData.maxPriorityFeePerGas),
      };
      let params = {
        ...contractCallData.params,
        value: contractCall.value,
      };

      if (txnData.status != "failed") {
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

          console.log("inside of router");
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

      //Save Transaction
      await updateTransaction(metadata.txnHash, {
        targetTimeStamp: txnData.blockTimeStamp,
        targetWallet: metadata.from,
        targetTransactionResult: txnData.status,
        targetMaxGwei: txnData.maxFeePerGas,
        targetMaxPriorityGwei: txnData.maxPriorityFeePerGas,
        targetGasLimit: txnData.gas,
        flowType: "MempoolTransaction",
      });

      res.json({ success: "txn performing" });
    }
  } catch (err) {
    console.log("error occured", err);
  }
});

app.use("/output", express.static(path.join(__dirname, "../../output/")));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
