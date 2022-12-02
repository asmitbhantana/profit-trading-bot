const express = require("express");
const { performBuyTransaction } = require("../contracts/action");
const { isTrackingwallet } = require("../database/action");
const { performBuySaleTransaction } = require("../monitor/performTxn");
const { performTransaction } = require("./performTxn");

//connect to the database
require("../database/connection");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const port = 4000;

app.post("/*", (req, res) => {
  console.log("-------New Request------");
  const txnData = req.body;
  console.log(txnData);
  if (txnData.status != "pending" || !isTrackingwallet(txnData.from)) {
    return;
  }
  const contractCall = txnData.contractCall;

  const currentRouter = contractCall.address;
  if (
    contractCall.contractAddress != "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  ) {
    let routerAddress = contractCall.contractAddress;
    let methodName = contractCall.methodName;
    let params = contractCall.params;

    performTransaction(methodName, routerAddress, params);
  }
  console.log("-------End Request------");
  res.json({ done: "done" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
