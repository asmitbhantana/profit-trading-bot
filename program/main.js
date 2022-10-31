const { getWalletERC20List } = require("./monitor/wallet");
const { Transaction, Token, TokenBundle } = require("./database/model");

//connect to database
require("./database/connection");

const scanWallet = async () => {
  const tokens = await getWalletERC20List(
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
  );
  console.log(tokens);

  //Update Database
  // const token1 = new Token({
  //   address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  //   amount: "1000",
  //   symbol: "BAT",
  // });
  // const token2 = new Token({
  //   address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96044",
  //   amount: "1200",
  //   symbol: "UNI",
  // });

  // const tokenBundle = new TokenBundle({
  //   tokens: [token1, token2],
  // });
  // tokenBundle._id = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

  // let updatedToken = await TokenBundle.findOneAndUpdate(
  //   {
  //     _id: "0xd8da6bf26964af9d7eed9e03e53415d37aa96046",
  //   },
  //   { tokens: [token1, token2] },
  //   {
  //     new: true,
  //     upsert: true,
  //   }
  // );

  // console.log(updatedToken);
};

scanWallet();
