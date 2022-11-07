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

const { Configuration, TokenBundle } = require('./model');

const createUpdateConfig = async function (type, config) {
  const updatedConfig = await Configuration.findOneAndUpdate(
    {
      setting_type: type,
    },
    config,
    {
      new: true,
      upsert: true,
    }
  );

  return updatedConfig;
};

const createUpdateTokens = async function (wallet, updatedTokens) {
  const updatedTokens = await TokenBundle.findOneAndUpdate(
    {
      id: wallet,
    },
    updatedTokens,
    {
      new: true,
      upsert: true,
    }
  );
};

modules.exports = {
  createUpdateTokens: createUpdateTokens,
  createUpdateConfig: createUpdateConfig
}
