import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Select} from "antd";
//import Web3Modal from "web3modal";
//import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { formatEther } from "@ethersproject/units";
import { usePoller, useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, QRBlockie, Wallet} from "./components";

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
const { Option } = Select;

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });

console.log("📡 Connecting to Ropsten");
const ropstenProvider = getDefaultProvider("ropsten", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });

console.log("📡 Connecting to Rinkeby");
const rinkebyProvider = getDefaultProvider("rinkeby", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });

console.log("📡 Connecting to Goerli");
const goerliProvider = getDefaultProvider("goerli", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });

console.log("📡 Connecting to Kovan");
const kovanProvider = getDefaultProvider("kovan", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });




// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const xdaiProviderUrl = "https://dai.poa.network";
console.log("🏠 Connecting to xdaiProviderUrl:", xdaiProviderUrl);
const xdaiProvider = new JsonRpcProvider(xdaiProviderUrl);


function App() {
  const [ render, setRender ] = useState(1)
  const [injectedProvider, setInjectedProvider] = useState();

  console.log("injectedProvider",injectedProvider)

  const DEFAULTCOLOR = ["#dddddd","#d4d4d4"]


  const defaultSelected = {provider: xdaiProvider, color1:DEFAULTCOLOR[0],color2:DEFAULTCOLOR[1]}

  const [ selectedAsset, setSelectedAsset ] = useState(
    defaultSelected
  );
  console.log("selectedAsset",selectedAsset)


  const userProvider = useUserProvider(injectedProvider, selectedAsset.provider);
  console.log("userProvider",userProvider)
  const address = useUserAddress(userProvider);
  console.log("🎫 Address: ",address)

  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai


  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourXdaiBalance = useBalance(xdaiProvider, address);
  console.log("💵 yourLocalBalance (xdai)",yourXdaiBalance)

  // just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  console.log("💵 yourMainnetBalance",yourMainnetBalance)

  const yourRopstenBalance = useBalance(ropstenProvider, address);
  console.log("💵 yourRopstenBalance",yourRopstenBalance)

  const yourRinkebyBalance = useBalance(rinkebyProvider, address);
  console.log("💵 yourRinkebyBalance",yourRinkebyBalance)

  const yourGoerliBalance = useBalance(goerliProvider, address);
  console.log("💵 yourGoerliBalance",yourGoerliBalance)

  const yourKovanBalance = useBalance(kovanProvider, address);
  console.log("💵 yourKovanBalance",yourKovanBalance)


  // Load in your local 📝 contract and read a value from it:
  //const readContracts = useContractLoader(localProvider)
  //console.log("📝 readContracts",readContracts)

  // keep track of a variable from the contract in the local React state:
  //const purpose = useContractReader(readContracts,"YourContract", "purpose")
  //console.log("🤗 purpose:",purpose)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  //const writeContracts = useContractLoader(userProvider)
  //console.log("🔐 writeContracts",writeContracts)

  //📟 Listen for broadcast events
  //const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);
  //console.log("📟 SetPurpose events:",setPurposeEvents)
/*
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);
*/

  const networks = [
    {
      name: "eth",
      balance: yourMainnetBalance,
      price: price,
      gasPrice: gasPrice,
      color1: "#626890",
      color2: "#5d658d",
      decimals: 3,
      provider: mainnetProvider
    },
    {
      name: "xdai",
      balance: yourXdaiBalance,
      price: 1,
      gasPrice: 1000000000,
      color1: "#47a8a5",
      color2: "#45a6a3",
      decimals: 3,
      provider: xdaiProvider
    },
    {
      name: "rinkeby",
      balance: yourRinkebyBalance,
      color1: "#f6c343",
      color2: "#f4c141",
      gasPrice: 4000000000,
      decimals: 3,
      provider: rinkebyProvider
    },
    {
      name: "ropsten",
      balance: yourRinkebyBalance,
      color1: "#ff4a8d",
      color2: "#fd4889",
      gasPrice: 4100000000,
      decimals: 3,
      provider: ropstenProvider
    },
    {
      name: "kovan",
      balance: yourKovanBalance,
      color1: "#7057ff",
      color2: "#6d53fc",
      gasPrice: 1000000000,
      decimals: 3,
      provider: kovanProvider
    },
    {
      name: "goerli",
      balance: yourGoerliBalance,
      color1: "#3099f2",
      color2: "#2d95ee",
      gasPrice: 4000000000,
      price: 0.0001,
      decimals: 3,
      provider: goerliProvider
    }

  ]
/*
  useEffect(()=>{
    if(selectedAsset.color1==DEFAULTCOLOR[0]){
      console.log("no asset found yet, checking for highest balance...")
      let best, highest
      for(let n in networks){
        const etherBalance = formatEther(networks[n].balance?networks[n].balance:0);
        console.log("n balalnce etherBalance",n,etherBalance)
        const floatBalance = networks[n].price * parseFloat(etherBalance?etherBalance:0).toFixed(networks[n].decimals);
        console.log("n balalnce floatBalance",n,floatBalance)
        if(!best || best < floatBalance){
          best = floatBalance
          highest = networks[n]
        }
      }
      console.log("BEST",best,highest)
      if(best&&best>0){
        console.log("🎖 Found value, setting to ",highest)
        setSelectedAsset(highest)
        console.log("setSelectedAsset",highest,selectedAsset)
        setTimeout(()=>{
          console.log("ECHO setSelectedAsset",highest,selectedAsset)
        },10000)
        console.log("render",render)
        setRender(render+1)
      }
    }
  },[setSelectedAsset,setRender,yourMainnetBalance,yourXdaiBalance])*/
  const [options, setOptions] = useState();
  useEffect(()=>{
    console.log("👀 checking options")
    let newOptions = []
    for(let n in networks){
      console.log("networks[n]",n,networks[n])
      const etherBalance = formatEther(networks[n].balance?networks[n].balance:0);
      console.log(etherBalance)
      const floatBalance = parseFloat(etherBalance?etherBalance:0).toFixed(networks[n].decimals);
      let dollarDisplay = ""
      if(floatBalance>0 && networks[n].price){
        dollarDisplay = "$"+parseFloat(networks[n].price*floatBalance).toFixed(2)
      }
      console.log("checking selected",networks[n].name==selectedAsset.name,networks[n].name,selectedAsset.name)
      newOptions.push(
        <Option key={n} selected={networks[n].name==selectedAsset.name} style={{color:networks[n].color1}}>{floatBalance} {networks[n].name} <span style={{color:"#999999",float:"right"}}>{dollarDisplay}</span></Option>
      )
    }
    setOptions(newOptions)
    if(!selectedAsset.name){
      console.log("NO NAME FOR ",selectedAsset.name)
      setSelectedAsset(networks[1])
    }
  },[setOptions,render,yourMainnetBalance,yourXdaiBalance,yourKovanBalance,yourGoerliBalance,yourRinkebyBalance,yourRopstenBalance])




  return (
    <div className="App" >
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />



      <div style={{position:"fixed",bottom:32,left:32,transform:"scale(1.67)",transformOrigin:"0 100%"}}>
        <Select size={"large"}
          placeholder="select asset..."
          onChange={(change)=>{
            console.log(change)
            setSelectedAsset(networks[change])
            setRender(render+1)
          }}
          style={{ width: 200 }}
        >
          {options}
        </Select>
      </div>

      <div style={{marginTop:-24}} key={render}>
        <Wallet
          address={address}
          provider={selectedAsset.provider}
          userProvider={userProvider}
          ensProvider={mainnetProvider}
          asset={selectedAsset}
        />
      </div>

      {/*
        ⚙️ Here is an example button that sets the purpose in your smart contract:

        <Button onClick={()=>{
        writeContracts.YourContract.setPurpose("🐖 Don't hog the block!")
      }}>Set Purpose</Button>
      */}

       {/* 👨‍💼 Your account is in the top right with a wallet at connect options
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
      </div>*/
    }

      {/*
          🎛 this scaffolding is full of commonly used components
          this <Contract/> component will automatically parse your ABI
          and give you a form to interact with it locally
          <Contract name="YourContract" signer={userProvider.getSigner()} provider={localProvider} address={address} />
      */}



      {/*

        📑 Maybe display a list of events?

        <div style={{ width:600, margin: "auto" }}>
        <List
          bordered
          dataSource={setPurposeEvents}
          renderItem={item => (
            <List.Item>
              {item[0]} =>
              {item[1]}
            </List.Item>
          )}
        />
      </div>

      */}


      {/* 🗑 Throw these away once you have 🏗 scaffold-eth figured out:
      <Hints address={address} yourLocalBalance={yourLocalBalance} price={price} mainnetProvider={mainnetProvider} />*/}


      {/* 🗺 Extra UI like gas price, eth price, faucet, and support:
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
               localProvider && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                 <Faucet localProvider={localProvider} price={price} />
               ) : (
                 ""
               )
             }
           </Col>
         </Row>
       </div>
       */}



    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
/*
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

*/
export default App;
