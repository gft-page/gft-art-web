import React, { useCallback, useEffect, useState, useMemo } from "react";
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
import 'antd/dist/antd.css'
import { SettingOutlined, SendOutlined, InboxOutlined, WalletOutlined, QrcodeOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, List, Tabs, Menu, Typography, Select, Form, notification, Card, PageHeader, Button, Spin } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, usePoller } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useLocalStorage } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, QRBlockie, PrivateKeyModal, AddressInput, EtherInput, Balance, TokenSender } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DEBUG = true

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)//getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });


function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  const [network, setNetwork] = useLocalStorage("network")
  const [selectedProvider, setSelectedProvider] = useState()

  const [erc20s, setErc20s] = useState({})

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
    url: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    erc20s: [
      {name: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f"},
      {name: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
    ]
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
    url: "http://localhost:8545",
    erc20s: [
      {name: "YourToken", address: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"}
    ]
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

  // just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(selectedProvider)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)

  function handleChange(value) {
  console.log(`selected ${value}`);
  let newNetwork = networks[value]
  setNetwork(newNetwork)
}

useEffect(() => {
  let newProvider
  if(network) {
  newProvider = new JsonRpcProvider(network.url);
} else {
  newProvider = new JsonRpcProvider(networks['mainnet']['url']);
}
setSelectedProvider(newProvider)
},[network, address])


const getErc20s = async () => {
  console.log("getting erc20s")
  if(network && network.erc20s && address) {
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
    network.erc20s.forEach(async element => {
      console.log(element)
      let userSigner = userProvider.getSigner()
      const erc20 = new ethers.Contract(element.address, abi, userSigner);
      let erc20Balance = erc20.balanceOf(address)
      let erc20Decimals = erc20.decimals()
      Promise.all([erc20Balance, erc20Decimals]).then((values) => {
        console.log(element.name, values)
        newErc20s[element.name] = {name: element.name, contract: erc20, decimals: values[1], balance: values[0], network: network.name}
      });
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

console.log(erc20s, network)

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
    <div className="App">
      <BrowserRouter>
      {/* ✏️ Edit the header and change the title to your project name */}
      <PageHeader
        title={`🧙 instant-wallet`}
        subTitle={<Select defaultValue={network?network.name:"mainnet"} style={{ width: 120 }} onChange={handleChange} size="large">
                  {Object.values(networks).map(n => (
                    <Option key={n.id}>{n.name}</Option>
                  ))}
                 </Select>}
        style={{ cursor: "pointer", backgroundColor: network?network.color1:"#626890" }}
        extra={[(address ? <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : <span>"Connecting..."</span>)]}
        ghost={false}
      />

      <Menu mode="horizontal" current={[route]} style={{fontSize: "28px", textAlign: "center", position: "fixed", left: 0, bottom: 0}}>
        <Menu.Item key="wallet" icon={<WalletOutlined style={{fontSize: "28px"}}/>}>
          <Link to="/wallet">Wallet</Link>
        </Menu.Item>
        <Menu.Item key="receive" icon={<QrcodeOutlined style={{fontSize: "28px"}}/>}>
          <Link to="/receive">Receive</Link>
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined style={{fontSize: "28px"}}/>}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="contract" icon={<FolderOpenOutlined style={{fontSize: "28px"}}/>}>
          <Link to="/contract">Contract</Link>
        </Menu.Item>
      </Menu>

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
                      size="large"
                      loading={sending}
                    >
                      <SendOutlined /> Send
                    </Button>
                    </Form.Item>
                  </Form>
          </Card>
          </Route>
          <Route path="/send-token">
            <Card style={{ width: 600, margin: 'auto'}}>
              <TokenSender network={network} erc20s={erc20s} mainnetProvider={mainnetProvider}/>
            </Card>
          </Route>
          <Route path="/receive">
            <div>
              <Text copyable ellipsis style={{fontSize: "28px", padding: 12}}>{address}</Text>
            </div>
            <QRBlockie address={address} />
          </Route>
          <Route path="/settings">
            <Card style={{ width: 600, margin: 'auto'}}>
              <PrivateKeyModal address={address}/>
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
                    selectedProvider && selectedProvider.connection && selectedProvider.connection.url && selectedProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                      <Faucet localProvider={selectedProvider} price={price} ensProvider={mainnetProvider}/>
                    ) : (
                      ""
                    )
                  }
                </Col>
              </Row>
            </Card>
          </Route>
          <Route path="/wallet">
            <Card style={{ width: 400, margin: 'auto'}}>
            <Row align="middle" justify="center">
            <Balance address={address} provider={selectedProvider} />
            <Link to={"/send"}><SendOutlined style={{fontSize: "28px"}}/></Link>
            </Row>
            <List
              itemLayout="horizontal"
              size="large"
              dataSource={(network&&network.erc20s)?network.erc20s:[]}
              renderItem={item => {
                let tokenBalance = (erc20s[item.name]?<span>{(erc20s[item.name]['balance'] / Math.pow(10, erc20s[item.name]['decimals']))}</span>:<Spin/>)
                let sendButton = (erc20s[item.name]&&erc20s[item.name]['balance']>0)?<Link to={"/send-token?token="+item.name}><SendOutlined/></Link>:null
                return (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={<>{tokenBalance} {sendButton}</>}
                  />
                </List.Item>)}}
            />
            </Card>
          </Route>
            <Route exact path="/contract">
              <Contract
                name="YourToken"
                signer={userProvider.getSigner()}
                provider={selectedProvider}
                address={address}
                blockExplorer={blockExplorer}
              />
            </Route>
        </Switch>
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
