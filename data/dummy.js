const originalWalletBalance = [
  {
    address: '0xBd9515FF22188EcebaAC76946cc9c7AfcB52b6b3',
    name: 'Kitty Token',
    decimals: 0,
    symbol: 'KITT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '36',
  },
  {
    address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    name: 'Basic Attention Token',
    decimals: 18,
    symbol: 'BAT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '17467248908296943231',
  },
  {
    address: '0x27f706edde3aD952EF647Dd67E24e38CD0803DD6',
    name: 'Useless Ethereum Token',
    decimals: 18,
    symbol: 'UET',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '48336410000000000000000',
  },
  {
    address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    name: 'OMGToken',
    decimals: 18,
    symbol: 'OMG',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '123646253428532080615067',
  },
  {
    address: '0x56ba2Ee7890461f463F7be02aAC3099f6d5811A8',
    name: 'BlockCAT Token',
    decimals: 18,
    symbol: 'CAT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '615897054678742624000',
  },
  {
    address: '0x0Cf0Ee63788A0849fE5297F3407f701E122cC023',
    name: 'Streamr (old)',
    decimals: 18,
    symbol: 'XDATA',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '130147537997596467278',
  },
  {
    address: '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6',
    name: 'MoonCats',
    decimals: 0,
    symbol: '🐱',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1',
  },
  {
    address: '0x72aDadb447784dd7AB1F472467750fC485e4cb2d',
    name: 'Worldcore',
    decimals: 6,
    symbol: 'WRC',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000',
  },
  {
    address: '0x7d3E7D41DA367b4FDCe7CBE06502B13294Deb758',
    name: 'SSS',
    decimals: 8,
    symbol: 'SSS',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000000',
  },
  {
    address: '0x94d6b4fB35fB08Cb34Aa716ab40049Ec88002079',
    name: 'Cryptonex (CNX) - Global Blockchain Acquiring',
    decimals: 8,
    symbol: 'CNX',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000',
  },
  {
    address: '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
    name: 'Rocket Pool',
    decimals: 18,
    symbol: 'RPL',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '2000000000000000000',
  },
  {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    name: 'ChainLink Token',
    decimals: 18,
    symbol: 'LINK',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000000000000000',
  },
  {
    address: '0x9B11EFcAAA1890f6eE52C6bB7CF8153aC5d74139',
    name: 'Attention Token of Media',
    decimals: 8,
    symbol: 'ATM',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '9900000000',
  },
  {
    address: '0x83cee9e086A77e492eE0bB93C2B0437aD6fdECCc',
    name: 'Goldmint MNT Prelaunch Token',
    decimals: 18,
    symbol: 'MNTP',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000000000',
  },
  {
    address: '0xab95E915c123fdEd5BDfB6325e35ef5515F1EA69',
    name: 'XENON',
    decimals: 18,
    symbol: 'XNN',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '2067839881594086940200',
  },
  {
    address: '0xfCe10CBf5171dc12c215BbCCa5DD75cbAEa72506',
    name: 'Kyber Genesis Token',
    decimals: 0,
    symbol: 'KGT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1',
  },
  {
    address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
    name: 'Enjin Coin',
    decimals: 18,
    symbol: 'ENJ',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '88355769620000000000',
  },
  {
    address: '0x7642F2C9670eaDDAfBBB2f1c93727DEa61A9a052',
    name: 'Anonymous',
    decimals: 18,
    symbol: 'ANON',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000000000000',
  },
  {
    address: '0x62a56a4A2Ef4D355D34D10fBF837e747504d38d4',
    name: '0x62a56a4A2Ef4D355D34D10fBF837e747504d38d4',
    decimals: 2,
    symbol: '',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '4500',
  },
  {
    address: '0xdb455c71C1bC2de4e80cA451184041Ef32054001',
    name: 'Jury.Online Token',
    decimals: 18,
    symbol: 'JOT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '500000000000000000',
  },
];

const oldWalletBalance = [
  {
    address: '0xBd9515FF22188EcebaAC76946cc9c7AfcB52b6b3',
    name: 'Kitty Token',
    decimals: 0,
    symbol: 'KITT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '36',
  },
  {
    address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    name: 'Basic Attention Token',
    decimals: 18,
    symbol: 'BAT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '17467248908296943231',
  },
  {
    address: '0x27f706edde3aD952EF647Dd67E24e38CD0803DD6',
    name: 'Useless Ethereum Token',
    decimals: 18,
    symbol: 'UET',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '48336410000000000000000',
  },
  {
    address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    name: 'OMGToken',
    decimals: 18,
    symbol: 'OMG',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '123646253428532080615067',
  },
  {
    address: '0x56ba2Ee7890461f463F7be02aAC3099f6d5811A8',
    name: 'BlockCAT Token',
    decimals: 18,
    symbol: 'CAT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '615897054678742624000',
  },
  {
    address: '0x0Cf0Ee63788A0849fE5297F3407f701E122cC023',
    name: 'Streamr (old)',
    decimals: 18,
    symbol: 'XDATA',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '130147537997596467278',
  },
  {
    address: '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6',
    name: 'MoonCats',
    decimals: 0,
    symbol: '🐱',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1',
  },
  {
    address: '0x72aDadb447784dd7AB1F472467750fC485e4cb2d',
    name: 'Worldcore',
    decimals: 6,
    symbol: 'WRC',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000',
  },
  {
    address: '0x7d3E7D41DA367b4FDCe7CBE06502B13294Deb758',
    name: 'SSS',
    decimals: 8,
    symbol: 'SSS',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000000',
  },
  {
    address: '0x94d6b4fB35fB08Cb34Aa716ab40049Ec88002079',
    name: 'Cryptonex (CNX) - Global Blockchain Acquiring',
    decimals: 8,
    symbol: 'CNX',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000',
  },
  {
    address: '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
    name: 'Rocket Pool',
    decimals: 18,
    symbol: 'RPL',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '2000000000000000000',
  },
  {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    name: 'ChainLink Token',
    decimals: 18,
    symbol: 'LINK',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1000000000000000000',
  },
  {
    address: '0x9B11EFcAAA1890f6eE52C6bB7CF8153aC5d74139',
    name: 'Attention Token of Media',
    decimals: 8,
    symbol: 'ATM',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '9900000000',
  },
  {
    address: '0x83cee9e086A77e492eE0bB93C2B0437aD6fdECCc',
    name: 'Goldmint MNT Prelaunch Token',
    decimals: 18,
    symbol: 'MNTP',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000000000',
  },
  {
    address: '0xab95E915c123fdEd5BDfB6325e35ef5515F1EA69',
    name: 'XENON',
    decimals: 18,
    symbol: 'XNN',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '2067839881594086940200',
  },
  {
    address: '0xfCe10CBf5171dc12c215BbCCa5DD75cbAEa72506',
    name: 'Kyber Genesis Token',
    decimals: 0,
    symbol: 'KGT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '1',
  },
  {
    address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
    name: 'Enjin Coin',
    decimals: 18,
    symbol: 'ENJ',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '88355769620000000000',
  },
  {
    address: '0x7642F2C9670eaDDAfBBB2f1c93727DEa61A9a052',
    name: 'Anonymous',
    decimals: 18,
    symbol: 'ANON',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '100000000000000000000',
  },
  {
    address: '0x62a56a4A2Ef4D355D34D10fBF837e747504d38d4',
    name: '0x62a56a4A2Ef4D355D34D10fBF837e747504d38d4',
    decimals: 2,
    symbol: '',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '4500',
  },
  {
    address: '0xdb455c71C1bC2de4e80cA451184041Ef32054001',
    name: 'Jury.Online Token',
    decimals: 18,
    symbol: 'JOT',
    logoURI: '',
    chain: 'ETH',
    network: 'mainnet',
    amount: '500000000000000000',
  },
];
