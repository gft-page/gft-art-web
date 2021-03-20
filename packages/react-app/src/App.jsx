import React, { useCallback, useEffect, useState } from "react";

import { BrowserRouter as Router } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Switch } from 'react-router-dom'
import SendersContainer from './containers/SendersContainer'
import ReceiversContainer from './containers/ReceiversContainer'
//import ReceiversContainer from './containers/ReceiversContainer'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';

import { useUserAddress } from "eth-hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch } from "./components";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";


const targetNetwork = NETWORKS['localhost']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const DEBUG = true

const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)

const blockExplorer = targetNetwork.blockExplorer;


function App() {
    const mainnetProvider = (scaffoldEthProvider && scaffoldEthProvider._network) ? scaffoldEthProvider : mainnetInfura


    const [injectedProvider, setInjectedProvider] = useState();
    const userProvider = useUserProvider(injectedProvider, localProvider);
    const address = useUserAddress(userProvider);

    let localChainId = localProvider && localProvider._network && localProvider._network.chainId
    if (DEBUG) console.log("🏠 localChainId", localChainId)

    let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId
    if (DEBUG) console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId)


    let networkDisplay = ""
    if (localChainId && selectedChainId && localChainId != selectedChainId) {
        networkDisplay = (
            <div style={{ zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16 }}>
                <h2>Wrong Network</h2>
                    You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
        )
    } else {
        networkDisplay = (
            <div style={{ zIndex: -1, position: 'absolute', right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
                {targetNetwork.name}
            </div>
        )
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


    return (
        <div className="App">
            {networkDisplay}

            <div style={{ textAlign: "right", right: 0, top: 0, padding: 10 }}>
                <Account
                    address={address}
                    localProvider={localProvider}
                    userProvider={userProvider}
                    mainnetProvider={mainnetProvider}
                    // price={price}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    blockExplorer={blockExplorer}
                />
            </div>

            <Container className="col-md-10">
                <Router>
                    <Link to="/">Sender</Link>
                    <br />
                    <Link to="/receiver">Receiver</Link>
                    <Container>
                        <Route exact path="/" component={() => <SendersContainer web3Modal={web3Modal} />} />
                        <Route path="/receiver" component={ReceiversContainer} />
                    </Container>
                </Router>
            </Container>
        </div>
    );
}

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

export default App