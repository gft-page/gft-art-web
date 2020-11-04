




# Emoji Support
## 🏗 scaffold-eth MVP CLR Example


```bash
git clone https://github.com/austintgriffith/scaffold-eth.git emoji-support

cd emoji-support

git checkout emoji-support
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

🔏 Edit the deploy script: `packages/buidler/scripts/deploy.js`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

📡 Deploy by creating account `yarn generate` send funds to `yarn account` and then edit `packages/buidler/buidler.config.js` defaultNetwork

🚢 Ship your app with `yarn build` and then `yarn surge` or `yarn s3`
