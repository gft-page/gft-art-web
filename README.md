# 🏗 scaffold-eth - 🔴 Optimistic NFTs 🎟

> A "buyer mints" NFT gallery running on a local Optimism stack

---

## 📦 Install

```bash
git clone -b optimistic-nfts https://github.com/austintgriffith/scaffold-eth.git optimistic-nfts

cd optimistic-nfts
```

```bash
yarn install
```

```bash
yarn start
```

> in a second terminal window:

__This requires Docker__

Initiate the Optimism submodules...
```bash
cd optimistic-nfts/docker/optimism-integration
git submodule init
git submodule update
```
Kick off the local chain, l2 & relay infrastructure (it kind of feels like a space-ship taking off)
```bash
cd optimistic-nfts/docker/optimism-integration
make up
```


## 🖼 Artwork

> ✏️ edit the `artwork.json` file to customize your artwork (or build a script to generate the artwork.json file 😉)


## 🗃 Upload

> Upload your artwork to IPFS and generate the list of "fingerprints" for each of your NFTs:

```bash
cd optimistic-nfts
yarn upload
```

## 🛰 Deploy

When you are ready to deploy `YourCollectible.sol`...

> Create a deployment mnemonic:

```bash
cd optimistic-nfts
yarn generate
```

> You can view/fund your deployer with `yarn account`

> Deploy the stack:

```
yarn deploy-oe
```

## 📱 Frontend

> Open [`http://localhost:3000`](http://localhost:3000) and try minting and sending around NFTs on your local Optimism stack:


*(hint: use an incognito window for a second account.)*
