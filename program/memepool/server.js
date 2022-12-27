const express = require("express");
const { performBuyTransaction } = require("../contracts/trackAction");
const { isTrackingwallet } = require("../database/action");
const { Router } = require("../database/model");
const {
  anaylizeTransaction,
  analyzeTransaction,
} = require("./anaylizeTransaction");

//connect to the database
require("../database/connection");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const port = 4000;

app.post("/*", async (req, res) => {
  const txnData = req.body;
  if (txnData.status != "pending" || !isTrackingwallet(txnData.from)) {
    return;
  }
  console.log("-------New Request------");

  const contractCall = txnData;
  const contractCallData = txnData.contractCall;
  console.log("Contract Call-------", contractCallData);
  let currentRouter = await Router.findOne({
    routerContract: contractCallData.contractAddress,
  }).exec();
  if (!currentRouter) return;

  let routerAddress = contractCallData.contractAddress;
  let methodName = contractCallData.methodName;
  let params = { ...contractCallData.params, value: contractCall.value };
  let metadata = {
    network: contractCall.network,
    from: contractCall.from,
    to: contractCall.to,
    value: contractCall.value,
    gasLimit: contractCall.gas,
  };

  await analyzeTransaction(methodName, routerAddress, params, metadata);
  res.json({ done: "done" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
