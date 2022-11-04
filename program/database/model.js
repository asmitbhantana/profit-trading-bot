const { TransactionSchema, TokenSchema, ConfigurationSchema, TokenBundleSchema } = require("./schema");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", TransactionSchema);

const Token = mongoose.model("Token", TokenSchema);

const TokenBundle = mongoose.model(
  "TokenBundle",
  TokenBundleSchema,
);

const Configuration = mongoose.model("Configuration", ConfigurationSchema);

module.exports = {
  Transaction: Transaction,
  Token: Token,
  TokenBundle: TokenBundle,
  Configuration: Configuration,
};
