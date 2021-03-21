import React, { useCallback, useEffect, useState } from "react";

import { BrowserRouter as Router } from 'react-router-dom'
import { Link, NavLink } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Switch } from 'react-router-dom'
import SendersContainer from './containers/SendersContainer'
import ReceiversContainer from './containers/ReceiversContainer'
//import ReceiversContainer from './containers/ReceiversContainer'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container';

import "antd/dist/antd.css";
import { Row, Col } from "antd";

import { useUserAddress } from "eth-hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch } from "./components";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";

const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)

const style = { padding: '8px 0' };

function App() {
    const mainnetProvider = mainnetInfura

    const [injectedProvider, setInjectedProvider] = useState();
    const address = useUserAddress(injectedProvider);
    const userProvider = useUserProvider(injectedProvider);

    const [network, setNetwork] = useState("");


    (async function () {
        if (userProvider) {
            const network = await userProvider.getNetwork()
            setNetwork(
                network.chainId === 1 ? "mainnet" :
                    network.chainId === 4 ? "rinkeby" :
                        "unsupported network"
            )
        }
    })()

    const blockExplorer = network == 'rinkeby' ? 'https://rinkeby.etherscan.io/' : 'https://etherscan.io/'

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
            <ThemeSwitch />
            <div style={{ textAlign: "right", right: 0, top: 0, padding: 10, position: 'abosolute' }}>
                <Account
                    address={address}
                    network={network}
                    // localProvider={localProvider}
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
                    <Row gutter={16}>
                        <Col>                   
                        <NavLink exact to="/" activeClassName="selected">Send</NavLink>
                        </Col>
                        <Col>
                        <NavLink to="/redeem" activeClassName="selected">Redeem</NavLink>
                        </Col>
                    </Row>
                        <Container>
                            <Route exact path="/" component={() => <SendersContainer web3Modal={web3Modal} network={network} />} />
                            <Route path="/redeem" component={() => <ReceiversContainer web3Modal={web3Modal} network={network} />} />
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