const inquirer = require('inquirer');
const {
  Transaction,
  Configuration,
  TransactionDone,
} = require('../database/model');
const { createSpinner } = require('nanospinner');

const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

//connect to the database
require('../database/connection');

const dateTime = new Date().toISOString();
const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

const exportPoolTransaction = () => {};

const exportTrackTransaction = async () => {
  const trackTransactions = await Transaction.find({}).exec();
  console.log(trackTransactions);
  const trackTransactionPath = path.join(
    __dirname,
    '..',
    '..',
    'output',
    `${dateTime}-track-transaction.csv`
  );

  const parser = new Parser(opts);
  fs.writeFileSync(trackTransactionPath, parser.parse(trackTransactions));
  return trackTransactionPath;
};

const exportCurrentConfiguration = async () => {
  const configuration = await Configuration.find({}).exec();
  const configPath = path.join(
    __dirname,
    '..',
    '..',
    'output',
    `${dateTime}-confugration`
  );
  const parser = new Parser(opts);
  fs.writeFileSync(configPath, parser.parse(configuration));
  return configPath;
};

const exportAllRouters = () => {};

const multipleQuestion = async () => {
  const answers = await inquirer.prompt({
    name: 'question_1',
    type: 'list',
    message: `
      Which data do you want to export?
      FYI: All of the transactions exported is found inside of the output folder
      `,
    choices: [
      'Pool Transaction',
      'Track Transaction',
      'Current Configuration',
      'All Routers',
    ],
  });
  // console.log("answer", answers);
  await handleAnswer(answers.question_1);
};

const handleAnswer = async (answer) => {
  const spinner = createSpinner('Checking And Exporting...').start();
  let exportFileName = 'empty';

  exportTrackTransaction();
  try {
    switch (answer) {
      case 'Pool Transaction':
        exportFileName = await exportPoolTransaction();
        break;
      case 'Track Transaction':
        exportFileName = await exportTrackTransaction();
        break;
      case 'Current Configuration':
        exportFileName = await exportCurrentConfiguration();
        break;
      case 'All Routers':
        exportFileName = await exportAllRouters();
        break;
      default:
        'Not Correct Exporting';
    }
    spinner.success({ text: `✅ Exported to ${exportFileName}` });
  } catch (err) {
    spinner.error({ text: `❌ Could not export to ${exportFileName}` });
  }
};

multipleQuestion();
