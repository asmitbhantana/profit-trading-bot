const { TransactionSchema, TokenSchema } = require("./schema");
const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", TransactionSchema);

const Token = mongoose.model("Token", TokenSchema);

const TokenBundle = mongoose.model(
  "TokenBundle",
  new mongoose.Schema({
    _id: String,
    tokens: [TokenSchema],
  })
);

module.exports = {
  Transaction: Transaction,
  Token: Token,
  TokenBundle: TokenBundle,
};
