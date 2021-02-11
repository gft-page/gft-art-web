# 🏗 scaffold-eth: Defi

> a box of Defi components built on top of a mainnet fork & uniswap & aave

---

## quickstart

```bash
git clone -b aave-ape https://github.com/austintgriffith/scaffold-eth.git aave-ape

cd aave-ape
```

```bash

yarn install

```

```bash

yarn start

```

- In a second terminal window run:

```bash

yarn fork

```
This branch uses a local fork of mainnet, which is easy to do with Hardhat ([see here to learn more](https://hardhat.org/guides/mainnet-forking.html)). The template configuration uses an Infura node, however this is not a full archive node, so it will only work for an hour or so. To get a long-lasting fork...
- Go to alchemyapi.io and get an API key for mainnet
- Replace the Infura URL with an Alchemy URL with your API key (i.e. https://eth-mainnet.alchemyapi.io/v2/<API_KEY_HERE>) into the `fork` script on line 28 of /packages/hardhat/package.json

- In a third terminal window run:

```bash

yarn deploy

```
> This deploys the associated contracts (AaveApe, AavEth, see below)

📱 Open http://localhost:3000 to see the app

## The components

🎶 Quick note! The mainnet fork a little while to get going - you may need to refresh several times before everything is cached and the app is fast and loading 💨💨💨

There are a few types of components in this branch:
- Utilities: simple helpers to aid local development (one so far!)
- Minimum viable components: recreating the apps of Defi protocols in a simple React component (Uniswap, Aave so far)
- New smart contracts: based on new smart contracts written in the /hardhat/ package

### SnatchToken
One of the benefits of using a mainnet fork is that you can impersonate Ethereum accounts you don't own, which is great for getting your hands on tokens! Building on top of an initial component by [@ironsoul](https://twitter.com/ironsoul0), this lets you specify the target, the token you are after and the amount you would like.
- Your target will need enough of the token, as well as some ETH to pay for the gas fee.
- The list of tokens comes from the [1inch tokenlist](https://tokenlists.org/token-list?url=tokens.1inch.eth)

### Swap
This is a minimum viable Uniswap UI (see more detail [here](https://azfuller20.medium.com/swap-with-uniswap-wip-f15923349b3d)), using token-lists. All you need to instantiate this is a provider with a signer (userProvider in scaffold-eth works fine!)
- You can update the token-list for the Swap component in the "Hints" tab
- Kudos to @ironsoul for the fresh Debounce hook
- TODO: split out data-fetching into a useUniswap() hook
- TODO: break it down into smaller components

### Lend
_This can be slow to load the first couple of times on a mainnet fork_

This component is a lightweight take on the Aave V2 market. You can view your overall position, key market stats, and your detailed asset position, viewing in native / ETH / USD. You can also make the key Aave transactions (deposit, withdraw, borrow, repay).

### SimpleLend
_Work in progress, missing some logical checks and UI improvements_

This is a simple component that lets you deposit or withdraw a single asset into the Aave V2 protocol.

### Ape
This is an experimental contract as part of this branch. The Aave Ape smart contract lets you increase your leverage, based on collateral deposited in Aave. The component walks you through the stages, but...
1. Select the token you want to go Long
2. Select the token you want to Short
3. Delegate credit to the AaveApe contract
4. Call the `ape()` function, or the `superApe()` function to leverage up multiple times in one transaction. This function uses your collateral to borrow the Short asset, swaps that for the Long asset, then deposits that back into Aave.
5. You can unwind your position by calling the `unwindApe()` function (you need to give the AaveApe contract an allowance on your aToken first, so it can withdraw it). Unwinding creates a flash loan to repay your owed amount in the Short token, then withdraws your Long token collateral, swaps it for the right amount of Short token, repays the flash loan and deposits any left-over collateral back into Aave

TODO:
- Test on mainnet
- Improving visibility of your position & health
- Supporting multi-currency?

### AavEth
Frontend component work in progress, this contract lets you deposit ETH into other assets in Aave (swapping via Uniswap, saving a transaction or two!), and then withdraw those same assets back to ETH.
