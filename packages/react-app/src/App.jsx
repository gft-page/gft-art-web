import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined, SendOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu, Typography, Select } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useLocalStorage } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, QRBlockie, PrivateKeyModal, AddressInput, EtherInput } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)
*/
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DEBUG = true

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
//if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
//const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProvider = new JsonRpcProvider(localProviderUrl);

// 🏠 Your local provider is usually pointed at your local blockchain
const xdaiProviderUrl = "https://dai.poa.network"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const xdaiProvider = new JsonRpcProvider(xdaiProviderUrl);

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });

console.log("📡 Connecting to Ropsten");
const ropstenProvider = getDefaultProvider("ropsten", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });

console.log("📡 Connecting to Rinkeby");
const rinkebyProvider = getDefaultProvider("rinkeby", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });

console.log("📡 Connecting to Goerli");
const goerliProvider = getDefaultProvider("goerli", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });

console.log("📡 Connecting to Kovan");
const kovanProvider = getDefaultProvider("kovan", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });



function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  const [network, setNetwork] = useLocalStorage("network")
  console.log(network)
  const [selectedProvider, setSelectedProvider] = useState(mainnetProvider)

  const networks = [
  {
    name: "xDAI",
    price: 1,
    gasPrice: 1000000000,
    color1: "#47a8a5",
    color2: "#45a6a3",
    decimals: 3,
    provider: xdaiProvider
  },
  {
    name: "ETH",
    price: price,
    gasPrice: gasPrice,
    color1: "#626890",
    color2: "#5d658d",
    decimals: 3,
    provider: mainnetProvider
  },
  {
    name: "DAI",
    price: 1,
    gasPrice: gasPrice,
    color1: "#e2b85d",
    color2: "#dbb459",
    decimals: 3,
    provider: mainnetProvider
  },
  {
    name: "Rinkeby",
    color1: "#f6c343",
    color2: "#f4c141",
    gasPrice: 4000000000,
    decimals: 3,
    provider: rinkebyProvider
  },
  {
    name: "Ropsten",
    color1: "#ff4a8d",
    color2: "#fd4889",
    gasPrice: 4100000000,
    decimals: 3,
    provider: ropstenProvider
  },
  {
    name: "Kovan",
    color1: "#7057ff",
    color2: "#6d53fc",
    gasPrice: 1000000000,
    decimals: 3,
    provider: kovanProvider
  },
  {
    name: "Goerli",
    color1: "#3099f2",
    color2: "#2d95ee",
    gasPrice: 4000000000,
    decimals: 3,
    provider: goerliProvider
  },
  {
    name: "localhost",
    color1: "#bbbbbb",
    color2: "#b9b9b9",
    gasPrice: 1000000000,
    decimals: 3,
    provider: localProvider
  },
  {
    name: "xMOON",
    color1: "#666666",
    color2: "#646464",
    gasPrice: 1000000000,
    price: 0.003,
    decimals: 3,
    provider: rinkebyProvider
  },
]

const [amount, setAmount] = useState();
const [toAddress, setToAddress] = useState();

const inputStyle = {
  padding: 10,
};

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, selectedProvider);
  const address = useUserAddress(userProvider);

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(selectedProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if(DEBUG) console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)

  function handleChange(value) {
  console.log(`selected ${value}`);
  let newNetwork = networks.filter(n => {
    return n.name == value
  })
  setNetwork(newNetwork[0])
  setSelectedProvider(newNetwork[0]['provider'])
}


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
  }, [ window.location.pathname ]);

  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">YourContract</Link>
          </Menu.Item>
          <Menu.Item key="/send">
            <Link onClick={()=>{setRoute("/send")}} to="/send">Send</Link>
          </Menu.Item>
          <Menu.Item key="/receive">
            <Link onClick={()=>{setRoute("/receive")}} to="/receive">Receive</Link>
          </Menu.Item>
          <Menu.Item key="/exampleui">
            <Link onClick={()=>{setRoute("/exampleui")}} to="/exampleui">ExampleUI</Link>
          </Menu.Item>
          <Menu.Item key="/settings">
            <Link onClick={()=>{setRoute("/settings")}} to="/settings">⚙️</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Contract
              name="YourContract"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/send">
          <div>
            <div style={inputStyle}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="to address"
                value={toAddress}
                onChange={setToAddress}
              />
            </div>
            <div style={inputStyle}>
              <EtherInput
                price={price}
                value={amount}
                onChange={value => {
                  setAmount(value);
                }}
              />
            </div>
            <Button
              key="submit"
              type="primary"
              disabled={!amount || !toAddress}
              loading={false}
              onClick={() => {
                const tx = Transactor(userProvider);

                let value;
                try {
                  value = parseEther("" + amount);
                } catch (e) {
                  // failed to parseEther, try something else
                  value = parseEther("" + parseFloat(amount).toFixed(8));
                }

                tx({
                  to: toAddress,
                  value,
                });
              }}
            >
              <SendOutlined /> Send
            </Button>
          </div>
          </Route>
          <Route path="/receive">
            <QRBlockie address={address} />
            <div>
              <Text copyable ellipsis>{address}</Text>
            </div>
          </Route>
          <Route path="/settings">
            <PrivateKeyModal address={address}/>
          </Route>
          <Route path="/exampleui">
            <ExampleUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
            />
          </Route>
        </Switch>
      </BrowserRouter>


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
         <Account
           address={address}
           localProvider={selectedProvider}
           userProvider={userProvider}
           mainnetProvider={mainnetProvider}
           price={price}
           web3Modal={web3Modal}
           loadWeb3Modal={loadWeb3Modal}
           logoutOfWeb3Modal={logoutOfWeb3Modal}
           blockExplorer={blockExplorer}
         />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>
           <Col span={8}>
             <Ramp price={price} address={address} />
           </Col>

           <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
             <GasGauge gasPrice={gasPrice} />
           </Col>
           <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
             <Button
               onClick={() => {
                 window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
               }}
               size="large"
               shape="round"
             >
               <span style={{ marginRight: 8 }} role="img" aria-label="support">
                 💬
               </span>
               Support
             </Button>
           </Col>
         </Row>

         <Row align="middle" gutter={[4, 4]}>
           <Col span={24}>
             {

               /*  if the local provider has a signer, let's show the faucet:  */
               localProvider && localProvider.connection && localProvider.connection.url && localProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                 <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider}/>
               ) : (
                 ""
               )
             }
           </Col>
         </Row>
         <Row align="middle" gutter={[4,4]}>
         <Col span={24}>
         <Select defaultValue={network?network.name:"ETH"} style={{ width: 120 }} onChange={handleChange}>
          {networks.map(n => (
            <Option key={n.name}>{n.name}</Option>
          ))}
         </Select>
         </Col>
         </Row>
       </div>

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
