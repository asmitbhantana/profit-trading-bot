const {
  TransactionSchema,
  ConfigurationSchema,
  TokenBundleSchema,
  RouterSchema,
  TransactionPoolSchema,
  TokenSchema,
} = require("./schema");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", TransactionSchema);

const TokenBundle = mongoose.model("TokenBundle", TokenBundleSchema);

const Configuration = mongoose.model("Configuration", ConfigurationSchema);

const Router = mongoose.model("Router", RouterSchema);

const TransactionPool = mongoose.model(
  "TransactionPool",
  TransactionPoolSchema
);

const Token = mongoose.model("Token", TokenSchema);

module.exports = {
  Transaction,
  TokenBundle,
  Configuration,
  Router,
  TransactionPool,
  Token,
};
