import React, { useCallback, useEffect, useState, useMemo } from "react";
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
import "antd/dist/antd.css";
import { SettingOutlined, SendOutlined, InboxOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu, Typography, Select, Form, notification, Card, PageHeader } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useLocalStorage } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, QRBlockie, PrivateKeyModal, AddressInput, EtherInput, Balance } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DEBUG = true

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProvider = new JsonRpcProvider(localProviderUrl);
const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)//getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });


function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  const [network, setNetwork] = useLocalStorage("network")
  console.log(network)
  const [selectedProvider, setSelectedProvider] = useState()

  const networks = {
  "xdai": {
    name: "xDAI",
    id: "xdai",
    price: 1,
    gasPrice: 1000000000,
    color1: "#47a8a5",
    color2: "#45a6a3",
    decimals: 3,
    url: "https://dai.poa.network"
  },
  "mainnet": {
    name: "ETH",
    id: "mainnet",
    price: price,
    gasPrice: gasPrice,
    color1: "#626890",
    color2: "#5d658d",
    decimals: 3,
    url: `https://mainnet.infura.io/v3/${INFURA_ID}`
  },
  /*"dai": {
    name: "DAI",
    id: "dai",
    price: 1,
    gasPrice: gasPrice,
    color1: "#e2b85d",
    color2: "#dbb459",
    decimals: 3,
    url: `https://mainnet.infura.io/v3/${INFURA_ID}`
  },*/
  "rinkeby": {
    name: "Rinkeby",
    id: "rinkeby",
    color1: "#f6c343",
    color2: "#f4c141",
    gasPrice: 4000000000,
    decimals: 3,
    url: `https://rinkeby.infura.io/v3/${INFURA_ID}`
  },
  "ropsten": {
    name: "Ropsten",
    id: "ropsten",
    color1: "#ff4a8d",
    color2: "#fd4889",
    gasPrice: 4100000000,
    decimals: 3,
    url: `https://ropsten.infura.io/v3/${INFURA_ID}`
  },
  "kovan": {
    name: "Kovan",
    id: "kovan",
    color1: "#7057ff",
    color2: "#6d53fc",
    gasPrice: 1000000000,
    decimals: 3,
    url: `https://kovan.infura.io/v3/${INFURA_ID}`
  },
  "goerli": {
    name: "Goerli",
    id: "goerli",
    color1: "#3099f2",
    color2: "#2d95ee",
    gasPrice: 4000000000,
    decimals: 3,
    url: `https://goerli.infura.io/v3/${INFURA_ID}`
  },
  "localhost": {
    name: "localhost",
    id: "localhost",
    color1: "#bbbbbb",
    color2: "#b9b9b9",
    gasPrice: 1000000000,
    decimals: 3,
    url: "http://localhost:8545"
  },
  /*"xmoon": {
    name: "xMOON",
    id: "xmoon",
    color1: "#666666",
    color2: "#646464",
    gasPrice: 1000000000,
    price: 0.003,
    decimals: 3,
    url: `https://rinkeby.infura.io/v3/${INFURA_ID}`
  },*/
  }

  useMemo(() => {
    let newProvider
    console.log('doing this thing')
    if(network) {
      console.log('there is a network', network)
    newProvider = new JsonRpcProvider(network.url);
  } else {
    console.log('no network')
    newProvider = new JsonRpcProvider(networks['mainnet']['url']);
  }
  setSelectedProvider(newProvider)
  },[network])

const [form] = Form.useForm();
const [sending, setSending] = useState(false)

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, selectedProvider?selectedProvider:mainnetProvider);
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
  let newNetwork = networks[value]
  setNetwork(newNetwork)
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
      <BrowserRouter>
      {/* ✏️ Edit the header and change the title to your project name */}
      <PageHeader
        title={`🧙 instant-wallet`}
        subTitle={<Select defaultValue={network?network.name:"mainnet"} style={{ width: 120 }} onChange={handleChange}>
                  {Object.values(networks).map(n => (
                    <Option key={n.id}>{n.name}</Option>
                  ))}
                 </Select>}
        style={{ cursor: "pointer", backgroundColor: network?network.color1:"#626890" }}
        ghost={false}
        extra={[
          <Link to="/send"><Button><SendOutlined/>Send</Button></Link>,
          <Link to="/receive"><Button><InboxOutlined/>Receive</Button></Link>,
          <Link to="/settings"><Button><SettingOutlined/>Settings</Button></Link>
        ]}
      />

        <Switch>
          <Route exact path="/"render={() => (
              <Redirect to="/send"/>
          )}/>
          <Route path="/send">
          <Card style={{ maxWidth: 600, margin: 'auto'}}>

            <Form
                    form={form}
                    initialValues={{ value: "0" }}
                    onFinish={async (values) => {
                      console.log(values)
                      setSending(true)
                      const tx = Transactor(userProvider);

                      let value;
                      try {
                        value = parseEther("" + values.amount);
                      } catch (e) {
                        // failed to parseEther, try something else
                        value = parseEther("" + parseFloat(values.amount).toFixed(8));
                      }

                      await tx({
                        to: values.toAddress,
                        value,
                      });
                      notification.open({
                        message: '👋 Sending successful!',
                        description:
                        `👀 Sent ${value} to ${values['toAddress']}`,
                      });
                      form.resetFields();
                      setSending(false)
                    }}
                    onFinishFailed={errorInfo => {
                      console.log('Failed:', errorInfo);
                      }}
                  >
                    <Form.Item name="toAddress">
                    <AddressInput
                      autoFocus
                      ensProvider={mainnetProvider}
                      placeholder="to address"
                    />
                    </Form.Item>
                    <Form.Item name="amount">
                    <EtherInput
                      price={(network&&network.price)?network.price:price}
                    />
                    </Form.Item>
                    <Form.Item >
                    <Button
                      htmlType="submit"
                      type="primary"
                      loading={sending}
                    >
                      <SendOutlined /> Send
                    </Button>
                    </Form.Item>
                  </Form>

          </Card>
          </Route>
          <Route path="/receive">
            <QRBlockie address={address} />
            <div>
              <Text copyable ellipsis>{address}</Text>
            </div>
          </Route>
          <Route path="/settings">
            <Card style={{ width: 600, margin: 'auto'}}>
              <PrivateKeyModal address={address}/>
            </Card>
          </Route>
        </Switch>
      </BrowserRouter>


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, bottom: 0, padding: 10 }}>
      {address ? <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : "Connecting..."}
      <Balance address={address} provider={selectedProvider} dollarMultiplier={(network&&network.price)?network.price:price} />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>
           <Col span={8}>
             <Ramp price={(network&&network.price)?network.price:price} address={address} />
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
