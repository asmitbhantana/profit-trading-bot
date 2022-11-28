const express = require("express");
const { isTrackingwallet } = require("../database/action");

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
  // if (
  //   contractCall.contractAddress != "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  // ) {
  //   let routerAddress = contractCall.contractAddress;
  //   let methodName = contractCall.methodName;
  //   let params = contractCall.params;

  //   //TODO: check router address
  //   switch (methodName) {
  //     //may be buy or sell
  //     case "swapExactTokensForTokens":
  //     case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
  //     case "swapExactTokenForExactTokens":
  //     case "swapTokensForExactTokens":

  //     //buy
  //     case "swapExactEthForTokens":
  //     case "swapExactETHForTokensSupportingFeeOnTransferTokens":
  //     case "swapETHForExactTokens":

  //     //sell
  //     case "swapExactTokensForETH":
  //     case "swapExactTokensForETHSupportingFeeOnTransferTokens":
  //     case "swapTokensForExactETH":
  //   }
  // }
  console.log("-------End Request------");
  res.json({ done: "done" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
