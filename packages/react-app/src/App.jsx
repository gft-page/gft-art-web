import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu, Select, Typography } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI } from "./views"
import { useQuery, gql } from '@apollo/client';
import {  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  Crosshair} from 'react-vis';
import "./ReactVis.css";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import fetch from 'isomorphic-fetch';


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
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
const { Title } = Typography;
const { TabPane } = Tabs;

const { Option } = Select;

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "https://dai.poa.network"
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);



function App(props) {

  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const GET_NIFTY_DAYDATA = gql`
  {
    dayTotals(first: 100, orderBy: id, orderDirection: desc) {
      id
      inks
    }
  }
  `;

  const { loading, error, data } = useQuery(GET_NIFTY_DAYDATA);
  let transformedData

  if (data) {
  transformedData = data['dayTotals'].map( s => ({x:new Date(s.id * 1000), y: parseFloat(s.inks)}) );
}

  const [crosshairValues, setCrosshairValues] = useState([]);

  const onMouseLeave = () => setCrosshairValues([]);
  const onNearestX = (value, {index}) => {
    setCrosshairValues([{x: value.x, y: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 5 }).format(value.y)}])
  }

  let inkGraph
  console.log(loading, error)

  if(data) {
    inkGraph = (
      <>
        <XYPlot xType="time" width={400} height={300} onMouseLeave={onMouseLeave}>
            <LineSeries
              data={transformedData}
              onNearestX={onNearestX}
              curve={'curveMonotoneX'}
              lineStyle={{stroke: 'red'}}
            />
            <Crosshair values={crosshairValues}/>
      </XYPlot>
    </>)
  }  else if (loading) {
      inkGraph = (<Typography>Loading...</Typography>)
    } else {
      inkGraph = (<pre>Bad: {error.message}
      </pre>)
    }

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  let price// = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  console.log("Location:",window.location.pathname)

  const [route, setRoute] = useState();
  useEffect(() => {
    console.log("SETTING ROUTE",window.location.pathname)
    setRoute(window.location.pathname)
  }, [ window.location.pathname ]);

  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Nifty</Link>
          </Menu.Item>
          <Menu.Item key="/graphiql">
            <Link onClick={()=>{setRoute("/graphiql")}} to="/graphiql">GraphiQL</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
          <div style={{ width:400, margin: "auto", marginTop:32 }}>
          <Title>Inks per day</Title>
          {inkGraph}
          </div>
          </Route>
          <Route path="/graphiql">
          <div style={{height:500, marginTop:32 }}>
          <GraphiQL fetcher={graphQLFetcher} />
          </div>
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>

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
