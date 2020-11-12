# 🏗 scaffold-eth - signature recover example

> an example of how to sign with the frontend and recover/verify signer in YourContract

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git signature-recover

cd signature-recover

git checkout signature-recover
```

```bash

yarn install

```

> you might get node-gyp errors, ignore them and run:

```bash

yarn start

```

> in a second terminal window:

```bash

yarn chain

```

> in a third terminal window:

```bash

yarn deploy

```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app


On deploy, trasfer the ownership to your frontend address in `packages/hardhat/scripts/deploy.js`:

![image](https://user-images.githubusercontent.com/2653167/98977842-5013ac80-24d6-11eb-8ded-8780d54701dd.png)

> redeploy your contracts so you will be the owner:

```bash

yarn deploy

```

(You can verify the `owner` in the `debug` tab)

YourContract should start with 0.1 ETH in it, craft a signature to send some but use a different account to "relay" the signature to YourContract.
