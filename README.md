
# AllowList Example

## 🏗 scaffold-eth

> using the graph, we keep track of an AllowList that an owner can update

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git allow-list-example

cd allow-list-example

git checkout allow-list-example
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

> in a third terminal make sure previous data is removed and start the graph docker container:

```bash

rm -rf docker/graph-node/data/

yarn graph-run-node

```

> in a fourth terminal (once your docker container is fully up):


```bash

yarn graph-create-local

yarn deploy-and-graph

```

🔏 Put your frontend address in `deploy.js` in `packages/buidler/scripts`

> redeploy with your address as the owner:

```bash

yarn deploy-and-graph

```

> add and remove addresses from the `AllowList`:


** todo screen **



> only addresses that are in the `AllowList` can update the `purpose` in YourContract:

** todo screen **
