import React, { useCallback, useEffect, useState } from 'react'

import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom'
import SendersContainer from './containers/SendersContainer'
import ReceiversContainer from './containers/ReceiversContainer'
import LearnContainer from './containers/LearnContainer'
import Container from 'react-bootstrap/Container'

import { Row, Col, Image, PageHeader } from 'antd'

import { useUserAddress } from 'eth-hooks'
import { Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch } from './components'
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from './hooks'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from './constants'

import 'antd/dist/antd.css'
import logo from './logo.svg'

const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)

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
                <Router>
                    <Container>
                        <PageHeader
                            title={
                                <Image
                                    width={200}
                                    src={logo}
                                />
                            }
                            className="site-page-header"
                            subTitle={
                                <Row gutter={16}>
                                    <Col>
                                        <NavLink exact to="/" activeClassName="selected">Send</NavLink>
                                    </Col>
                                    <Col>
                                        <NavLink to="/redeem" activeClassName="selected">Redeem</NavLink>
                                    </Col>
                                    <Col>
                                        <NavLink to="/learn" activeClassName="selected">Learn</NavLink>
                                    </Col>
                                </Row>
                            }
                            extra={[
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
                            ]}
                        >
                        </PageHeader>

                    </Container>
                    <Route exact path="/" component={() => <SendersContainer web3Modal={web3Modal} network={network} />} />
                    <Route path="/redeem" component={() => <ReceiversContainer web3Modal={web3Modal} network={network} />} />
                    <Route path="/learn" component={() => <LearnContainer />} />
                </Router>
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