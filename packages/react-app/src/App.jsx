import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Typography, Select, Form, Card, Layout, Affix } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, usePoller } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useBalance, useLocalStorage } from "./hooks";
import { Contract, Balance } from "./components";
import { ethers } from "ethers";
import { Receive, TokenSender, Sender, WalletFooter, WalletHeader, Wallet, Settings } from "./views"
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Header, Content, Footer } = Layout;

const DEBUG = true

const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)//getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });


function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  const [network, setNetwork] = useLocalStorage("networkName")
  const [selectedProvider, setSelectedProvider] = useState()

  const [erc20s, setErc20s] = useState({})
  const [myErc20s, setMyErc20s] = useLocalStorage("myErc20s")

  const networks = {
  "xdai": {
    name: "xDAI",
    id: "xdai",
    price: 1,
    gasPrice: 1000000000,
    color1: "#47a8a5",
    color2: "#45a6a3",
    decimals: 3,
    url: "https://dai.poa.network",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
    erc20s: [
      {name: "USDC", address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", decimals: 6}
    ]
  },
  "mainnet": {
    name: "ETH",
    id: "mainnet",
    price: price,
    gasPrice: gasPrice,
    color1: "#626890",
    color2: "#5d658d",
    decimals: 3,
    url: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
    erc20s: [
      {name: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 18},
      {name: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6}
    ]
  },
  "rinkeby": {
    name: "Rinkeby",
    id: "rinkeby",
    color1: "#f6c343",
    color2: "#f4c141",
    gasPrice: 4000000000,
    decimals: 3,
    url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
    erc20s: [
      {name: "test", address: "0xc3994c5cbddf7ce38b8a2ec2830335fa8f3eea6a", decimals: 0}
    ]
  },
  "ropsten": {
    name: "Ropsten",
    id: "ropsten",
    color1: "#ff4a8d",
    color2: "#fd4889",
    gasPrice: 4100000000,
    decimals: 3,
    faucet: "https://faucet.dimensions.network/",
    blockExplorer: "https://ropsten.etherscan.io/",
    url: `https://ropsten.infura.io/v3/${INFURA_ID}`
  },
  "kovan": {
    name: "Kovan",
    id: "kovan",
    color1: "#7057ff",
    color2: "#6d53fc",
    gasPrice: 1000000000,
    decimals: 3,
    url: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://faucet.kovan.network/"
  },
  "goerli": {
    name: "Goerli",
    id: "goerli",
    color1: "#3099f2",
    color2: "#2d95ee",
    gasPrice: 4000000000,
    decimals: 3,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    url: `https://goerli.infura.io/v3/${INFURA_ID}`
  },
  "localhost": {
    name: "localhost",
    id: "localhost",
    color1: "#bbbbbb",
    color2: "#b9b9b9",
    gasPrice: 1000000000,
    decimals: 3,
    url: "http://localhost:8545",
    erc20s: [
      {name: "YourToken", address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", decimals: 18}
    ]
  },
  }

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, selectedProvider?selectedProvider:mainnetProvider);
  const address = useUserAddress(userProvider);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourBalance = useBalance(selectedProvider, address);

  function handleChange(value) {
  console.log(`selected ${value}`);
  let newNetwork = value
  setNetwork(newNetwork)
}

function addMyErc20(name, address, decimals) {
console.log(`Adding ${name} at ${address} with ${decimals} decimals`);
let newMyErc20s = Object.assign({}, myErc20s);
if(newMyErc20s[network]) {
  newMyErc20s[network].push({name: name, address: address, decimals: decimals})
} else {
  newMyErc20s[network] = []
  newMyErc20s[network].push({name: name, address: address, decimals: decimals})
}
setNetwork(newMyErc20s)
}

useEffect(() => {
  let newProvider
  if(network) {
  newProvider = new JsonRpcProvider(networks[network].url);
} else {
  newProvider = new JsonRpcProvider(networks['mainnet']['url']);
}
setSelectedProvider(newProvider)
setErc20s({})
},[network, address])


const getErc20s = async () => {
  console.log("getting erc20s")
  if(network && networks[network].erc20s && address) {
    // A Human-Readable ABI; any supported ABI format could be used
    const abi = [
        // Read-Only Functions
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",

        // Authenticated Functions
        "function transfer(address to, uint amount) returns (boolean)",

        // Events
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    let newErc20s = Object.assign({}, erc20s);
    networks[network].erc20s.forEach(async element => {
      console.log(element)
      let userSigner = userProvider.getSigner()
      const erc20 = new ethers.Contract(element.address, abi, userSigner);
      newErc20s[element.name] = {name: element.name, contract: erc20, decimals: element.decimals, balance: "100", network: networks[network].name}
    });
    //console.log(newErc20s)
    setErc20s(newErc20s)
  }
}

usePoller(
  () => {
    getErc20s();
  },
  props.pollTime ? props.pollTime : 4000,
);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname)
    console.log(route)
  }, [ window.location.pathname ]);

  return (
    <div className="App" style={{height:"100%", minHeight:"100%" }}>
      <BrowserRouter>
      <Layout style={{minHeight:"100%", display:"flex", flexDirection: "column"}}>
        <Affix offsetTop={0}>
        <Header style={{backgroundColor: network?networks[network].color1:"#626890", height: "fit-content", verticalAlign: "middle"}}>
          <WalletHeader address={address} network={network} networks={networks} handleChange={handleChange}/>
        </Header>
        </Affix>
        <Content style={{ padding: '0 50px', margin: 0, flex: 1, justifyContent: "center", height: "fit-content", display:"flex", flexDirection: "column"}}>

          <Switch>
            <Route exact path="/"render={() => (
                <Redirect to="/wallet"/>
            )}/>
            <Route path="/send">
            <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
              <Balance address={address} provider={selectedProvider} size={64} />
              <Sender
                userProvider={userProvider}
                mainnetProvider={mainnetProvider}
                network={network}
                networks={networks}
                price={price}
                gasPrice={gasPrice}
                />
            </Card>
            </Route>
            <Route path="/send-token">
              <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                <TokenSender network={network} networks={networks} erc20s={erc20s} mainnetProvider={mainnetProvider} selectedProvider={selectedProvider} address={address}/>
              </Card>
            </Route>
            <Route path="/receive">
              <Receive address={address}/>
            </Route>
            <Route path="/settings">
              <Settings
                address={address}
                network={network}
                networks={networks}
                gasPrice={gasPrice}
                price={price} />
            </Route>
            <Route path="/wallet">
              <Wallet
                address={address}
                selectedProvider={selectedProvider}
                yourBalance={yourBalance}
                network={network}
                networks={networks}
                price={price}
                mainnetProvider={mainnetProvider}
                erc20s={erc20s}
                />
            </Route>
              <Route exact path="/contract">
                <Row>
                <Contract
                  name="YourToken"
                  signer={userProvider.getSigner()}
                  provider={selectedProvider}
                  address={address}
                />
              </Row>
              </Route>
                <Route exact path="/manage-erc20s">
                  <Card style={{ margin: 'auto'}}>
                  <span>test</span>
                  </Card>
                </Route>
          </Switch>
        </Content>
        <Footer style={{padding: 0, zIndex: 100}}>
          <Affix offsetBottom={0}>
          <WalletFooter route={route}/>
          </Affix>
        </Footer>
      </Layout>
      </BrowserRouter>

    </div>
  );
}


/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default App;
