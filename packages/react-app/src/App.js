import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Row, Col, Button, Alert, Spin } from 'antd';
import { useExchangePrice, useGasPrice, useContractLoader, useEventListener, useCustomContractLoader, useNonce, useContractReader } from "./hooks"
import { Header, Account, Provider, Faucet, Ramp, AddressInput, Contract, TokenBalance, Address } from "./components"
import { Transactor } from "./helpers"

const mainnetProvider = new ethers.providers.InfuraProvider("mainnet", "c954231486fa42ccb6d132b406483d14")
//const rinkebyProvider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/c954231486fa42ccb6d132b406483d14")
const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : "http://localhost:8545")

function App() {

  const DEPLOYBLOCK = 1

  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider)
  const gasPrice = useGasPrice("fast")

  const readContracts = useContractLoader(localProvider);
  const writeContracts = useContractLoader(injectedProvider);

  const MOONSADDRESS = readContracts ? readContracts["Moons"].address : ""
  const MOONSContract = useCustomContractLoader(injectedProvider, "Moons", MOONSADDRESS)

  const earlyAccessEvents = useEventListener(readContracts, "xMoonLanding", "EarlyAccess", localProvider, DEPLOYBLOCK);
  const moonPrice = useContractReader(readContracts, "xMoonLanding", "price")

  const tx = Transactor(injectedProvider)
  const nonce = useNonce(injectedProvider, address, 3555)
  const [hasEarlyAccess, setHasEarlyAccess] = useState()


  const [sendingTx, setSendingTx] = useState()

  useEffect(() => {
    for (let e in earlyAccessEvents) {
      if (earlyAccessEvents[e].sender == address) {
        setHasEarlyAccess(true);
      }
    }
  }, [earlyAccessEvents, address])

  const [injectedNetwork, setInjectedNetwork] = useState();
  console.log(injectedNetwork)
  useEffect(() => {
    const getNetwork = async () => {
      if (injectedProvider) {
        let injectedNetwork = await injectedProvider.getNetwork()
        setInjectedNetwork(injectedNetwork)
      }
    }
    getNetwork()
  }, [injectedProvider])

  let display

  if (hasEarlyAccess) {
    display = (
      <div>
        <h1>Thank you for your support!</h1>
        <h2><Address value={address} ensProvider={mainnetProvider} /> will have early access to 🌒xMOON!</h2>
        <h2>Check back here soon for updates and <a href="https://t.me/joinchat/KByvmRsUzUmPw8prHwATNw" target="_blank">join this Telegram</a> for more info.</h2>
      </div>
    )
  } else if (injectedNetwork && injectedNetwork.name != "rinkeby" && injectedNetwork.chainId != "31337") {

    display = (
      <div>
        <Alert message={(
          <div>
            <b>Warning!</b> You must be on 'Rinkeby' testnet.
            <div style={{ padding: 16 }}>
              <img src="/rinkeby.png" />
            </div>
          </div>

        )} type="error" />
      </div>
    )
  } else if (!moonPrice) {
    display = (
      <div>
        <div style={{ width: 320, margin: "auto", padding: 16 }}>
          <Spin/>
        </div>
      </div>
    )
  } else {

    display = (
      <div>


        <div style={{ width: 320, margin: "auto", padding: 16 }}>
          <Button loading={sendingTx} size="large" shape="round" type="primary" onClick={() => {
            setSendingTx(true)
            tx(MOONSContract.approve(readContracts['xMoonLanding'].address, ethers.utils.parseEther("500", { nonce: nonce })))
            setTimeout(
              async () => {
                let result = await tx(writeContracts["xMoonLanding"].earlyAccess({ gasLimit: 120000, nonce: nonce + 1 }))
                console.log("result")
                setTimeout(
                  () => {
                    setSendingTx(false)
                  }, 20000
                )
              }, 100
            )
          }}>Request Early Access for {ethers.utils.formatEther(moonPrice)} 🌘</Button>
        </div>
      </div>
    )
  }


  return (
    <div className="App">
      <Header />
      <div style={{ position: 'fixed', textAlign: 'right', right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
        />
        <TokenBalance name={"Moons"} img={"🌘"} address={address} contracts={readContracts} />
      </div>

      {display}

      <div style={{ width: "77vw", margin: "auto" }}>

        <div>
          xMOON is a massivle multiplayer blockchain game powered by the 🐶 DAOG game engine.
        </div>
        <div>
          Players use Reddit's MOON token to wager and play! Coming Summer 2020!!!
        </div>
        <div>
          In an attempt to build 🌒 xMOON liquidity, players are asked to send {moonPrice?ethers.utils.formatEther(moonPrice):0} 🌘 MOONs for early access.
        </div>
        
        <div>
          Created by <a href="https://twitter.com/austingriffith" target="_blank">Austin Griffith</a>
        </div>


        <div style={{padding:32}}>
          (🌘 MOONs are just a testnet token on Rinkeby <a target="_blank" href="https://www.forbes.com/sites/colinharper/2020/05/14/reddit-launches-ethereum-tokens-for-subbredits-in-new-community-points-campaign/#706974b8533c">deployed by Reddit</a>. They won't have any value until we give them <i>utility</i>!)
        </div>


        <iframe style={{ marginTop: 32 }} width="916" height="854" src="https://www.youtube.com/embed/a902XUZbZQU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>

      {/* <div style={{display:"none"}}>
      <Contract
        name={"xMoonLanding"}
        // show={["init"]}
        provider={injectedProvider}
        address={address}
      />

      <Contract
        name={"Moons"}
        show={["approve", "allowance"]}
        provider={injectedProvider}
        address={address}
      />
      </div> */}

      {/* <div style={{ position: 'fixed', textAlign: 'left', left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={4}>
          <Col span={9}>
            <Ramp
              price={price}
              address={address}
            />
          </Col>
          <Col span={15}>
            <Faucet
              localProvider={localProvider}
              price={price}
            />
          </Col>
        </Row>
      </div> */}

    </div>
  );
}

export default App;
