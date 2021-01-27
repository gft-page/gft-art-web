# 🏗 scaffold-eth

> is everything you need to get started building decentralized applications powered by smart contracts

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git

cd scaffold-eth
```

```bash

yarn install

```

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

![image](https://user-images.githubusercontent.com/26670962/105990031-e9129680-60c7-11eb-98bc-4ba4cbe1bcf2.png)

> If you don't have a proxy created you can simply do it by a click of a button in a secured manne!.

![image](https://user-images.githubusercontent.com/26670962/105990296-47d81000-60c8-11eb-961d-172f613c1941.png)

> Once created you can fund your proxy with Mock DAI and of course eth and any erc20 asset in a mainstream scenario.


### What the hell is Minimal Proxy ?
Say you need to deploy a wallet for each user your dApp onboards in a secure way such that say a particular user can only have control of their own wallet.

Deploying large contracts can be quite expensive, there’s a clever workaround through which you can deploy the same contract thousands of times with minimal deployment costs: It’s called [EIP 1167](https://eips.ethereum.org/EIPS/eip-1167), but let’s just call it Minimal Proxy.

If you are interested to know somewhat technical details watch this as I go a bit more technical.

### How does it work?
Minimal means minimal. That is, all the proxy contract will do is delegate all calls to the implementation – nothing more, nothing less. Make sure you do not confuse EIP 1167 minimal proxy contracts with the proxy pattern used for contract upgrades.

EIP 1167 has nothing to do with upgradeability nor tries to replace it.

The working of a minimal proxy is as follows sequentially
* **Recieve Encoded Transaction Data** with CALLDATACOPY opcode to copy the tx data into memory.
* **Forwards the received data to Implementation Contract** i.e the contract with which the user wants to interact with using [DELEGATECALL](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7.md).
* **Retrieve the result of the external call** with the help of RETURNDATACOPY opcode.
* **Return data to the caller or revert the transaction** with the help of JUMPI, RETURN, REVERT opcodes.

