require('dotenv').config();
const mongoose = require('mongoose');

const connect = async () => {
  try {
    // const connectionString = "mongodb://localhost:27017/";
    const connectionString = `mongodb+srv://copy-trading-bot:${process.env.MONGO_PASSWORD}@cluster0.9bqy7.mongodb.net/TradingData?retryWrites=true&w=majority`;
    await mongoose.connect(connectionString);
  } catch (error) {
    console.log(error);
  }
};

connect();
