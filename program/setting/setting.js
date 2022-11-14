const { createUpdateConfig } = require('../database/action');

const setConfig = async () => {
  let config = {
    maximumWeth: '0.001',
    minimumWeth: '0.0001',
    amountPercentage: '200',
    trackingWallet: '0xa69319fCBDF2E8DD7A768b9ce97db952cd92433d',
    tokens: [
      '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e',
      '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      '0x0e239dB593619bcF6248FdeF4723f26cf40e1f37',
      '0xB702124910c880e6E52a1F403d66645155017a4D',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    ],
    wallets: [
      '0xa69319fCBDF2E8DD7A768b9ce97db952cd92433d',
      '0x369Ec1589fa18735fB92cE11fE9cE2B9AD20769d',
    ],
    untrackedTokens: [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ],
  };

  await createUpdateConfig(config);
};

module.exports = {
  setConfig: setConfig,
};
