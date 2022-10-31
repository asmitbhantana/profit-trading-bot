const mongoose = require("mongoose");

const { Schema } = mongoose;

const TokenSchema = new Schema({
  address: String,
  amount: String,
  date: { type: Date, default: Date.now },
  symbol: String,
});

const TransactionSchema = new Schema({
  hash: String,
  success: Boolean,
  tokenAddress: String,
  date: { type: Date, default: Date.now },
  value: String,
  sender: String,
  receiver: String,
  transactionType: String,
});

module.exports = {
  TokenSchema: TokenSchema,
  TransactionSchema: TransactionSchema,
};
