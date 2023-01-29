require("dotenv").config();
const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectionString = "mongodb://127.0.0.1:27017/";
    // const connectionString = `mongodb+srv://copy-trading-bot:${process.env.MONGO_PASSWORD}@cluster0.9bqy7.mongodb.net/TradingData?retryWrites=true&w=majority`;
    // const connectionString = `mongodb+srv://copy-trading-bot:${process.env.MONGO_PASSWORD}>@cluster0.9bqy7.mongodb.net/?retryWrites=true&w=majority`;
    let connected = await mongoose.connect(connectionString);
    mongoose.set("strictQuery", true);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error on DB", error);
  }
};

connect();
