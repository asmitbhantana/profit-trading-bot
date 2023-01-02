const { default: inquirer } = require("inquirer");
const { Configuration } = require("../database/model");

const exportPoolTransaction = () => {};

const exportTrackTransaction = () => {};

const exportCurrentConfiguration = async () => {
  const configuration = await Configuration.find({}).exec();
};

const exportAllRouters = () => {};

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
  return handleAnswer(answers.question_1);
};

const handleAnswer = async (answer) => {
  const spinner = createSpinner("Checking And Exporting...").start();

  try {
    const exportFileName = "empty";

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
    }
    spinner.success({ text: `✅ Exported to ${exportFileName}` });
  } catch (err) {
    spinner.error({ text: `❌ Could not export to ${exportFileName}` });
  }
};

await multipleQuestion();
