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

const createUpdateConfig = async function (config) {
  const updatedConfig = await Configuration.findOneAndUpdate({}, config, {
    new: true,
    upsert: true,
  });

  return updatedConfig;
};

const createUpdateTokens = async function (wallet, updatedTokens) {
  const newUpdatedTokens = await TokenBundle.findOneAndUpdate(
    {
      wallet: wallet,
    },
    updatedTokens,
    {
      new: false,
      upsert: true,
    }
  );
};

module.exports = {
  createUpdateTokens: createUpdateTokens,
  createUpdateConfig: createUpdateConfig,
};
