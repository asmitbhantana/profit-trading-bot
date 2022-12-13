const express = require("express");
const { performBuyTransaction } = require("../contracts/action");
const { isTrackingwallet } = require("../database/action");
const { Router } = require("../database/model");
const { performTransaction } = require("./performTxn");

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

  const contractCall = txnData.contractCall;

  let currentRouter = await Router.findOne({
    routerContract: contractCall.contractAddress,
  }).exec();
  if (!currentRouter) return;

  let routerAddress = contractCall.contractAddress;
  let methodName = contractCall.methodName;
  let params = contractCall.params;
  console.log("Performing Transactions");
  await performTransaction(methodName, routerAddress, params);
  console.log("-------End Request------");

  res.json({ done: "done" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
