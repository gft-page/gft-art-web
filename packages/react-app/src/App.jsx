import React, { useCallback, useEffect, useState, useMemo } from "react";
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
//import 'antd/dist/antd.css'
import { SettingOutlined, SendOutlined, InboxOutlined, WalletOutlined, QrcodeOutlined, FolderOpenOutlined, SmileOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, List, Tabs, Menu, Typography, Select, Form, notification, Card, PageHeader, Button, Spin, Layout, Space, Affix, Table, Descriptions } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, usePoller } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useLocalStorage } from "./hooks";
import { Account, Faucet, Ramp, Contract, GasGauge, Address, QRBlockie, PrivateKeyModal, AddressInput, EtherInput, Balance, TokenSender } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import Blockies from "react-blockies";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Header, Content, Footer } = Layout;

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
      {name: "USDC", address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"}
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
    url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
    erc20s: [
      {name: "test", address: "0xc3994c5cbddf7ce38b8a2ec2830335fa8f3eea6a"}
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
      {name: "YourToken", address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}
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

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(selectedProvider)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)

  function handleChange(value) {
  console.log(`selected ${value}`);
  let newNetwork = value
  setNetwork(newNetwork)
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
      let erc20Balance = erc20.balanceOf(address)
      let erc20Decimals = erc20.decimals()
      Promise.all([erc20Balance, erc20Decimals]).then((values) => {
        console.log(element.name, values)
        newErc20s[element.name] = {name: element.name, contract: erc20, decimals: values[1], balance: values[0], network: networks[network].name}
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

  let networkColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Color',
    dataIndex: 'color1',
    key: 'color1',
    render: text => <span style={{color:text}}>{text}</span>
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Blockexplorer',
    dataIndex: 'blockExplorer',
    key: 'blockExplorer',
    render: text => <a>{text}</a>
  },
  {
    title: 'Node URL',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  }]

  return (
    <div className="App" style={{height:"100%", minHeight:"100%" }}>
      <BrowserRouter>
      <Layout style={{minHeight:"100%", display:"flex", flexDirection: "column"}}>
        <Affix offsetTop={0}>
        <Header style={{backgroundColor: network?networks[network].color1:"#626890", height: "fit-content", verticalAlign: "middle"}}>
          <Row align="middle" justify="center" gutter={12} style={{padding: 8}}>
              <Col span={8}>
              <Row align="middle" justify="center" gutter={4}>
                <Link style={{fontSize:60}} to="/wallet">🧙</Link>
              </Row>
              </Col>
              <Col span={8}>
              <Row align="middle" justify="center" gutter={4}>
                {(address ?
                    <Blockies seed={address.toLowerCase()} size={8} scale={8}/>
                  : <span>"Connecting..."</span>)}
              </Row>
              </Col>
              <Col span={8}>
                <Select defaultValue={network?networks[network].name:"mainnet"} style={{ width: 120 }} onChange={handleChange} size="large">
                          {Object.values(networks).map(n => (
                            <Option key={n.id}>{n.name}</Option>
                          ))}
                         </Select>
              </Col>
          </Row>
        </Header>
        </Affix>
        <Content style={{ padding: '0 50px', margin: 0, flex: 1, justifyContent: "center", height: "fit-content", display:"flex", flexDirection: "column"}}>

          <Switch>
            <Route exact path="/"render={() => (
                <Redirect to="/wallet"/>
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
                        price={(network&&networks[network].price)?networks[network].price:price}
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
              <QRBlockie address={address} />
              <Row align="middle" justify="center" gutter={[4, 4]}>
                <Text copyable ellipsis style={{fontSize: "28px", padding: 12}}>{address}</Text>
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
            </Route>
            <Route path="/settings">
              <Card style={{ margin: 'auto'}}>
                <Row align="middle" justify="center" gutter={[8, 8]}>
                  <Space>
                    <PrivateKeyModal address={address}/>
                    {(network&&networks[network].blockExplorer&&address)?<a href={networks[network].blockExplorer+"address/"+address} target="_blank"><Button>Blockexplorer</Button></a>:null}
                  </Space>
                </Row>
                <Row align="middle" gutter={[8, 8]}>
                  <Col span={8}>
                    <Ramp price={(network&&networks[network].price)?networks[network].price:price} address={address} />
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
                <Row>
                <Table
                dataSource={Object.values(networks)}
                columns={networkColumns}
                expandable={{
                  expandedRowRender: record => <Descriptions>{
                    record.erc20s.map(
                      (r)=>
                        <Descriptions.Item label={r.name}>
                          {<a href={record.blockExplorer+"address/"+r.address} target="_blank">{r.address}</a>}
                        </Descriptions.Item>
                      )
                    }</Descriptions>,
                  rowExpandable: record => record.erc20s,
                }}
                />
                </Row>
              </Card>
            </Route>
            <Route path="/wallet">
              <Row align="middle" justify="center">
                <Col>
                  <Row align="middle" justify="center">
                  <Balance address={address} provider={selectedProvider} size={96} />
                  {(yourLocalBalance&&yourLocalBalance.gt(0))?<Link to={"/send"}><SendOutlined style={{fontSize: "96px"}}/></Link>:null}
                  {(network&&networks[network].faucet&&yourLocalBalance&&yourLocalBalance.eq(0))?<a href={networks[network].faucet} target="_blank"><SmileOutlined style={{fontSize: "72px"}}/></a>:null}
                  </Row>
                  {(network&&networks[network].erc20s)?<List
                    itemLayout="horizontal"
                    size="large"
                    dataSource={(network&&networks[network].erc20s)?networks[network].erc20s:[]}
                    renderItem={item => {
                      let tokenBalance = (erc20s[item.name]?<Text style={{
                        verticalAlign: "middle",
                        fontSize: 32,
                        padding: 8,
                      }}>{(erc20s[item.name]['balance'] / Math.pow(10, erc20s[item.name]['decimals']))}</Text>:<Spin/>)
                      let sendButton = (erc20s[item.name]&&erc20s[item.name]['balance']>0)?<Link to={"/send-token?token="+item.name}><SendOutlined style={{fontSize: 32, padding: 8, verticalAlign: "middle"}}/></Link>:null
                      return (
                      <List.Item>
                        <Text
                          strong={true}
                          style={{
                            verticalAlign: "middle",
                            fontSize: 32,
                            padding: 8,
                          }}
                        >
                          {item.name}
                        </Text>
                        {tokenBalance} {sendButton}
                      </List.Item>)}}
                  />:null}
                </Col>
              </Row>
            </Route>
              <Route exact path="/contract">
                <Row>
                <Contract
                  name="YourToken"
                  signer={userProvider.getSigner()}
                  provider={selectedProvider}
                  address={address}
                  blockExplorer={blockExplorer}
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
            <Menu mode="horizontal" current={[route]} theme="dark" style={{textAlign: "center"}}>
              <Menu.Item key="wallet">
                <Link to="/wallet">
                  <WalletOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
              <Menu.Item key="receive">
                <Link to="/receive">
                  <QrcodeOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
              <Menu.Item key="settings">
                <Link to="/settings">
                  <SettingOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
            </Menu>
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
