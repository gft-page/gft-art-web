# 🏗 scaffold-eth gets optimistic

> [optimism](https://optimism.io/) proof-of-concept

---

## quickstart

```bash
git clone -b oo-ee https://github.com/austintgriffith/scaffold-eth.git optimistic-scaffold

cd optimistic-scaffold
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

__This requires Docker__

```bash
cd scaffold-eth/docker/optimism-integration
make up

```

> in a third terminal window, generate a local account:

```bash
cd scaffold-eth
yarn generate
```
Send that account some ETH using the faucet from http://localhost:3000/ to fund the deployments

> when the local nodes are up and running, deploy local contracts & attempt to go from L1 -> L2!
```
yarn deploy-oe
```

## Notes
- Is OE eompatible with hardhat config accounts? I had to instantiate in my deploy script
- Get a silent failure on L2 if I don't reset the nonces in Metamask
