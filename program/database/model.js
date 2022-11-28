const {
  TransactionSchema,
  TokenSchema,
  ConfigurationSchema,
  TokenBundleSchema,
  RouterSchema,
} = require("./schema");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", TransactionSchema);

const Token = mongoose.model("Token", TokenSchema);

const TokenBundle = mongoose.model("TokenBundle", TokenBundleSchema);

const Configuration = mongoose.model("Configuration", ConfigurationSchema);

const Router = mongoose.model("Router", RouterSchema);

module.exports = {
  Transaction,
  Token,
  TokenBundle,
  Configuration,
  Router,
};
