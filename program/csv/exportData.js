const inquirer = require("inquirer");
const {
  TransactionDone,
  Configuration,
  TransactionPool,
  Router,
} = require("../database/model");
const { createSpinner } = require("nanospinner");

const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

//connect to the database
require("../database/connection");

let dateTime = new Date().toISOString();
dateTime = dateTime.replaceAll(":", "-");

const exportPoolTransaction = async () => {
  const poolTransactions = await TransactionDone.find({}).exec();
  const poolTransactionPath = path.join(
    __dirname,
    "..",
    "..",
    "output",
    `${dateTime}-meme-pool.csv`
  );

  const opts = {
    fields: [
      "targetTimeStamp",
      "targetHash",
      "targetWallet",
      "targetTransactionResult",
      "targetEthAmount",
      "targetFeeAmount",
      "targetMaxGwei",
      "targetMaxPriorityGwei",
      "targetGasLimit",
      "targetTokenAmount",

      //common
      "tokenContract",
      "transactionType",
      "flowType",

      //Our
      "ourTimeStamp",
      "ourHash",
      "ourTransactionResult",
      "ourGasUsed",
      "ourEthAmount",
      "ourFeeAmount",
      "ourMaxGwei",
      "ourMaxPriorityGwei",
      "ourGasLimit",
      "ourTokenAmount",
    ],
  };
  const parser = new Parser(opts);
  fs.writeFileSync(poolTransactionPath, parser.parse(poolTransactions));
  return poolTransactionPath;
};

const exportTrackTransaction = async () => {
  const trackTransactions = await TransactionPool.find({}).exec();
  const trackTransactionPath = path.join(
    __dirname,
    "..",
    "..",
    "output",
    `${dateTime}-track-transaction.csv`
  );

  const opts = {
    fields: [
      "targetWallet",
      "tokenAddress",
      "transactionHash",
      "previousBalance",
      "newBalance",
      "started",
      "confirmed",
      "failed",
    ],
  };
  const parser = new Parser(opts);
  fs.writeFileSync(trackTransactionPath, parser.parse(trackTransactions));
  return trackTransactionPath;
};

const exportCurrentConfiguration = async () => {
  const configuration = await Configuration.find({}).exec();
  const configPath = path.join(
    __dirname,
    "..",
    "..",
    "output",
    `${dateTime}-configuration.csv`
  );

  const opts = {
    fields: [
      "maximumWeth",
      "minimumWeth",
      "amountPercentage",
      "ourWallet",
      "tokens",
      "wallets",
      "untrackedTokens",
      "maxGasLimit",
      "maxPriorityFee",
    ],
  };
  const parser = new Parser(opts);
  fs.writeFileSync(configPath, parser.parse(configuration));
  return configPath;
};

const exportAllRouters = async () => {
  const routers = await Router.find({}).exec();
  const routerPath = path.join(
    __dirname,
    "..",
    "..",
    "output",
    `${dateTime}-router.csv`
  );

  const opts = {
    fields: [
      "routerContract",
      "routerName",
      "wethAddress",
      "factoryAddress",
      "network",
      "chainName",
      "rpc",
      "version",
    ],
  };
  const parser = new Parser(opts);
  fs.writeFileSync(routerPath, parser.parse(routers));
  return routerPath;
};

const multipleQuestion = async () => {
  const answers = await inquirer.prompt({
    name: "question_1",
    type: "list",
    message: `
      Which data do you want to export?
      FYI: All of the transactions exported is found inside of the output folder
      `,
    choices: [
      "Pool Transaction",
      "Track Transaction",
      "Current Configuration",
      "All Routers",
    ],
  });
  await handleAnswer(answers.question_1);
};

const handleAnswer = async (answer) => {
  const spinner = createSpinner("Checking And Exporting...").start();
  let exportFileName = "empty";

  exportTrackTransaction();
  try {
    switch (answer) {
      case "Pool Transaction":
        exportFileName = await exportPoolTransaction();
        break;
      case "Track Transaction":
        exportFileName = await exportTrackTransaction();
        break;
      case "Current Configuration":
        exportFileName = await exportCurrentConfiguration();
        break;
      case "All Routers":
        exportFileName = await exportAllRouters();
        break;
      default:
        "Not Correct Exporting";
        break;
    }
    spinner.success({ text: `✅ Exported to ${exportFileName}` });
    process.exit(0);
  } catch (err) {
    spinner.error({ text: `❌ Could not export to ${exportFileName}` });
    process.exit(0);
  }
};

multipleQuestion();
