/*
Transactions:

find all transactions
 filters:
  -sender
  -date
  -receipents
  -value
  -hash

Tokens:

  find all tokens
   filters:
   - sender
   - tokens

Configurations:
  store all the config 
  update all the config
 */

const { Configuration, TokenBundle, Router } = require("./model");
const { RouterSchema } = require("./schema");

const createUpdateConfig = async function (config) {
  const updatedConfig = await Configuration.findOneAndUpdate({}, config, {
    new: true,
    upsert: true,
  }).exec();

  return updatedConfig;
};

const addRouter = async function (router) {
  const newRouter = new Router(router);
  newRouter.save();

  return newRouter;
};

const createUpdateTokens = async function (wallet, token, updatedTokens) {
  const newUpdatedTokens = await TokenBundle.findOneAndUpdate(
    {
      wallet: wallet,
      token_address: token,
    },
    updatedTokens,
    {
      new: false,
      upsert: true,
    }
  ).exec();

  return newUpdatedTokens;
};

const updateTokenBalance = async function (wallet, token, new_balance) {
  const tokenToUpdate = await TokenBundle.findOneAndUpdate(
    {
      wallet: wallet,
      token_address: token,
    },
    { balance: new_balance }
  ).exec();

  return tokenToUpdate;
};

const isTrackingwallet = async (wallet) => {
  const config = await Configuration.findOne({}).exec();
  return config.wallets.include(wallet, 0);
};

module.exports = {
  createUpdateTokens,
  createUpdateConfig,
  isTrackingwallet,
  addRouter,
  updateTokenBalance,
};
