require("dotenv").config();
const { compose } = require("async");
const ethers = require("ethers");
const { Nonce } = require("../database/model");

let provider = null;
let precision = ethers.BigNumber.from("10000");

const getEthersProvider = (API_URL) => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(API_URL);
  }

  return provider;
};

let c = 0;

const getCurrentNonce = async (provider, userAddress) => {
  // let lastUsed = await Nonce.findOne({}).exec();
  let nonce = await provider.getTransactionCount(userAddress);
  // console.log("getting nonce", nonce); // 89
  // console.log("last used nonce", lastUsed); //89
  // if (lastUsed != null && lastUsed.lastUsedNonce >= nonce) {
  //   console.log("updating to ", lastUsed.lastUsedNonce + 1);

  //   const updated = await Nonce.findOneAndUpdate(
  //     {},
  //     { lastUsedNonce: lastUsed.lastUsedNonce + 1 }
  //   );

  //   console.log("updated nonce", updated);

  //   return updated.lastUsedNonce;
  // } else {
  //   console.log("updating nonce", nonce);
  //   const updated = await Nonce.findOneAndUpdate(
  //     {},
  //     { lastUsedNonce: nonce },
  //     { upsert: true, new: true }
  //   );

  //   console.log("updated nonce", updated);

  return nonce;
  // }
};

module.exports = {
  getEthersProvider,
  getCurrentNonce,
  precision,
};
