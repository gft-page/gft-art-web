# 🏗 scaffold-eth: Uniswapper

> a component for swapping erc20s on Uniswap (plus tokenlists + local forks of mainnet!)

---

## quickstart

```bash
git clone -b uniswapper https://github.com/austintgriffith/scaffold-eth.git uniswapper-scaffold

cd uniswapper-scaffold
```

```bash

yarn install

```

```bash

yarn start

```

This branch uses a local fork of mainnet, which is easy to do with Hardhat ([see here to learn more](https://hardhat.org/guides/mainnet-forking.html)):
- Go to alchemyapi.io and get an API key for mainnet
- Put that API key into the `forking` URL on line 52 of /packages/hardhat/hardhat.config.js
- In a second terminal window run:

```bash

yarn mainnet-fork

```

📱 Open http://localhost:3000 to see the app

Notes:
- If you connect your metamask, you will need to change the chainId of your localhost network config to be 1
- This widget uses [tokenlists](https://tokenlists.org/) to import the erc20s of your choice
