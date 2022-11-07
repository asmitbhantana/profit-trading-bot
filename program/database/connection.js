require("dotenv").config();
const mongoose = require("mongoose");

const connectionString = `mongodb+srv://copy-trading-bot:${process.env.MONGO_PASSWORD}@cluster0.9bqy7.mongodb.net/TradingData?retryWrites=true&w=majority`;

mongoose.connect(connectionString);
