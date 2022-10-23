The goal is to have a bot that copies multiple wallets that buy/sell on Uniswap on Ethereum, with the following features:

- Monitor multiple wallets on ETH blockchain
- The dex we will use is Uniswap. So if the wallet is not using the Uniswap router, we won't copy the tx
- Copy the buy and sell transaction immediately after they make the transaction.
- Every target transaction must be frontran, meaning that our transaction must be confirmed on the blockchain before the target transaction. To achieve this, we must copy the gas parameters from the target transaction and increment X gwei value. We must have the option of increasing both the base fee and priority fee by either an absolute value or a %.
- Must copy the slippage value of the target transactions
- Possibly use WETH as buy currency (to be faster)
- Have a max gwei that can be used in any single transaction. If the target value or our own after the increment exceeds this, then do not make the transaction
- For determining the buying trade size we will not copy the target exactly, instead, the rules for calculating the amount of ETH to use are:
  a. If Target wallet buy size <= X (we set this amount), then copy exactly the value
  b. If Target wallet buy size > X , it uses a Y % of that, set by us, leaving us with Z trade size
  c. If Z > A (set by us as the absolute maximum to use for tx), use a maximum of eth set by us
  d. We must have a minimum also, in case Z < W (minimum), we should use W
- Be able to use all methods from Uniswap: "Swap exact tokens", "multicall", Uniswap v2 and v3, etc.
- After buying a token, we need to approve it immediately to be able to sell it later on
- When copying the target’s sell transaction, we need to sell the same proportion of tokens the target does. For example, if target sells 50% of his tokens, we sell 50% of our own token
- Export a results file with the history of transactions. It needs to be compatible with excel to analyze. It needs to contain time stamp, tx hash, from wallet, to wallet, eth amount, fee amount, token amount
- We must be able to handle the case in which the target tx fails and we buy a token it didn’t buy. A solution to this is to check the target transaction, if it failed, we must immediately sell. Another solution might be to check our tokens vs target every X amount time, and see if we have any tokens the target wallet doesn’t (meaning his tx failed when he bought), in this case we would decide manually what is the best option.
- If our tx fails and the target tx is approved, we must redo it immediately.
- If both txs fail, no action is needed.

As for the infrastructure, there are 2 options we must analyze together:

1. Free AWS VPS and hire node services such as Alchemy and Blocknative for node/mempool.
2. Another option is that if we are to consult many times the previous services, it might be better in $ terms to have a more robust VPS and host our own Ethereum node.

Final considerations:

- A frontend UI is not needed, it can be handled through the command line on a Linux server

- The code must be commented

- It must be made in a modular way, so in the future, if we want to transform it to work with other EVM-compatible chains or other dexes, it can be easily done.
