import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert, Space, Card, Radio, Input, List} from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader, useBurnerSigner, useAddress, useDebounce } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, Balance } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS, L1ETHGATEWAY, L2DEPOSITEDERC20 } from "./constants";
import { ethers } from "ethers";

/// 📡 What chain are your contracts deployed to?
const mainnetNetwork = NETWORKS['mainnet'];
const l1Network = NETWORKS['localL1'];
const l2Network = NETWORKS['localL2'];

// 😬 Sorry for all the console logging
const DEBUG = false

const mainnetProvider = new JsonRpcProvider(mainnetNetwork.rpcUrl);
const l1Provider = new JsonRpcProvider(l1Network.rpcUrl);
const l2Provider = new JsonRpcProvider(l2Network.rpcUrl);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)


function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(l1Network,mainnetProvider);
  const gasPrice = useGasPrice(l1Network,"fast");

  const l2Burner = useBurnerSigner(l2Provider)
  const l1Burner = useBurnerSigner(l1Provider)
  const mainnetBurner = useBurnerSigner(mainnetProvider)

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const l1User = injectedProvider ? injectedProvider.getSigner() : l1Burner
  const l2User = injectedProvider ? injectedProvider.getSigner() : l2Burner

  const address = useAddress(l1User);
  if(DEBUG) console.log("👩‍💼 selected address:",address)

  // You can warn the user if you would like them to be on a specific network
  let l1ChainId = l1Provider && l1Provider._network && l1Provider._network.chainId
  let l2ChainId = l2Provider && l2Provider._network && l2Provider._network.chainId
  let injectedChainId = injectedProvider && injectedProvider._network && injectedProvider._network.chainId

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const l1Tx = Transactor(l1User, gasPrice)
  const l2Tx = Transactor(l2User, gasPrice)


  /*
  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if(DEBUG) console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const l1Contracts = useContractLoader(l1Provider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)
  */
  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:

  const [layer, setLayer] = useState(1)


  //const ETHContract = useExternalContractLoader(ethUser, ethAddress, ethAbi)
  //
  // Then read your DAI balance like:
  //const myMainnetDAIBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])
  //console.log("🥇 myMainnetDAIBalance:",myMainnetDAIBalance)

  const l1Contracts = useContractLoader(l1Provider)
  const l2Contracts = useContractLoader(l2Provider)

  let L1ETHGatewayContract = new ethers.Contract("0x9934FC453d11334e6bFbE5D3856A2c0E917D26f1", L1ETHGATEWAY, l1User)
  let L2ETHGatewayContract = new ethers.Contract("0x4200000000000000000000000000000000000006", L2DEPOSITEDERC20, l2User)

  //📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(l2Contracts, "YourContract", "SetPurpose", l2Provider, 1);
  console.log("📟 SetPurpose events:",setPurposeEvents)



  const getCode = async () => {
    let _address = "0xa6EFAA50c89A304b881c6D170C1fC1B5a1B6C9Bf"
    let code = await l2Provider.getCode(_address)
    console.log(code)
  }


  let networkDisplay
  /*
  if(localChainId && selectedChainId && localChainId != selectedChainId ){
    networkDisplay = (
      <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  }else{
    networkDisplay = (
      <div style={{zIndex:-1, position:'absolute', right:154,top:28,padding:16,color:targetNetwork.color}}>
        {targetNetwork.name}
      </div>
    )
  }
  */

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
  }, [setRoute]);

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          /*type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time*/
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }


  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Account</Link>
          </Menu.Item>
          <Menu.Item key="/your-contract">
            <Link onClick={()=>{setRoute("/your-contract")}} to="/your-contract">YourContract</Link>
          </Menu.Item>
          <Menu.Item key="/eth-gateway">
            <Link onClick={()=>{setRoute("/eth-gateway")}} to="/eth-gateway">ETH Gateway</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
          <Card title={address ? <Address address={address} ensProvider={mainnetProvider} /> : "Connecting..."}>
          <Balance address={address} provider={l1Provider} price={price} prefix={"L1"} />
          <Balance address={address} provider={l2Provider} price={price} prefix={"L2"} />
          </Card>
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
          </Route>
          <Route exact path="/your-contract">
            <Contract
              name="YourContract"
              signer={l2User}
              provider={l2Provider}
            />
            <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
            <h2>Events:</h2>
            <List
              bordered
              dataSource={setPurposeEvents}
              renderItem={(item) => {

                const milliseconds = parseInt(item[2].toString()) * 1000 // 1575909015000
                const dateObject = new Date(milliseconds)
                const humanDateFormat = dateObject.toLocaleString() //2019-12-9 10:30:15

                return (
                  <List.Item key={item.blockNumber+"_"+item.sender+"_"+item.purpose}>
                    <Address
                        address={item[0]}
                        ensProvider={mainnetProvider}
                        fontSize={16}
                      /> =>
                    {humanDateFormat}
                  </List.Item>
                )
              }}
            />
          </div>
            <Contract
              name="ERC20"
              signer={l1User}
              provider={l1Provider}
            />
            <Contract
              name="L1ERC20Gateway"
              signer={l1User}
              provider={l1Provider}
            />
            <Contract
              name="L2DepositedERC20"
              signer={l2User}
              provider={l2Provider}
            />


            { /* uncomment for a second contract:
            <Contract
              name="SecondContract"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */ }

            { /* Uncomment to display and interact with an external contract (DAI on mainnet):
            <Contract
              name="DAI"
              customContract={mainnetDAIContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */ }
          </Route>
          <Route path="/eth-gateway">
            <Space direction="vertical">
            <Radio.Group
                  options={["1","2"]}
                  onChange={(e) => { setLayer(e.target.value)}}
                  value={layer}
                  optionType="button"
                />
              {/*<Contract
                name={`Layer ${layer} ETH`}
                customContract={ETHContract}
                signer={layer === 1 ? l1User : l2User}
                provider={layer === 2 ? l1Provider : l2Provider}
                address={address}
              />*/}
            </Space>
          </Route>
        </Switch>
      </BrowserRouter>


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Address address={address} ensProvider={mainnetProvider} />
        <Balance address={address} provider={l1Provider} price={price} color={l1Network.color}/>
        <Balance address={address} provider={l2Provider} price={price} prefix={"L2"} color={l2Network.color}/>
         {modalButtons}

      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>
           <Col span={8}>
             <Ramp price={price} address={address} networks={NETWORKS}/>
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
                 <Faucet localProvider={l1Provider} price={price} ensProvider={mainnetProvider}/>
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

 window.ethereum && window.ethereum.on('chainChanged', chainId => {
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;
