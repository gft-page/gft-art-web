import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Row, Col, Typography, Button, Modal, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useExchangePrice, useGasPrice } from "./hooks"
import { Transactor } from "./helpers"
import { Header, Account, Provider, AddressInput, EtherInput, Blockie, Balance, Address } from "./components"
import QR from 'qrcode.react';
const { Text } = Typography;

const mainnetProvider = new ethers.providers.InfuraProvider("mainnet","2717afb6bf164045b5d5468031b93f87")
let localProvider
if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")){
  localProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
}else{
  localProvider = new ethers.providers.JsonRpcProvider("https://dai.poa.network")
}

function App() {

  const size = useWindowSize();
  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = 1
  const gasPrice = useGasPrice("fast")

  const [open, setOpen] = useState()
  const [amount, setAmount] = useState()
  const [toAddress, setToAddress] = useState()


  const inputStyle = {
    padding:10
  }

  return (
    <div className="App">
      <Header />
      <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
        <Account
          minimized={true}
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
        />
      </div>

      <Row type="flex" align="middle">
        <Col span={12}>
          <div style={{transformOrigin:"50% 0%",transform:"scale("+(size.width/2)/250+")"}}>
            <Blockie address={address} scale={27}/>
          </div>
        </Col>
        <Col span={12}>
          <div style={{transformOrigin:"50% 0%",transform:"scale("+(size.width/2)/250+")"}}>
            <QR value={address?address:""} size={"220"} renderAs={"svg"} imageSettings={{excavate:false}}/>
          </div>
        </Col>
      </Row>
      <Row type="flex" align="middle" >
        <Col span={12} style={{zIndex:2}}>
          <div style={{transformOrigin:"50% -350%",transform:"scale("+(size.width/2)/200+")",fontSize:22,paddingTop:6}}>
            <Text copyable={{text:address}}>{address?address.substr(0,8):"..."}</Text>
          </div>
        </Col>
        <Col span={12} style={{zIndex:1}}>
          <div style={{transformOrigin:"50% -350%",transform:"scale("+(size.width/2)/200+")",paddingTop:6}}>
            <Balance address={address} provider={injectedProvider} dollarMultiplier={price}/>
          </div>
        </Col>
      </Row>

      <div style={{cursor:"pointer",position:'fixed',width:"25vw",height:"25vw",textAlign:'center',right:-4,bottom:8,padding:10}} className={"button"}
        onClick={()=>{setOpen(!open)}}
      >
        <Row type="flex" align="middle" >
          <Col span={24} style={{zIndex:2}}>
            <SendOutlined style={{color:"#EDEDED",fontSize:"14vw",marginTop:"4vw"}} rotate={0} />
          </Col>
        </Row>
      </div>

    

      <Modal
        visible={open}
        title={
          <div>
            {address?(
              <Address value={address} ensProvider={mainnetProvider}/>
            ):<Spin />}
            <div style={{float:"right",paddingRight:25}}>
              <Balance address={address} provider={injectedProvider} dollarMultiplier={price}/>
            </div>
          </div>
        }
        onOk={()=>{setOpen(!open)}}
        onCancel={()=>{
          setOpen(!open)
        }}
        footer={[
          <Button key="hide" type="default"  onClick={()=>{
            setOpen(!open)
          }}>
            Hide
          </Button>,
          <Button key="submit" type="primary" disabled={!amount || !toAddress} loading={false} onClick={()=>{
            const tx = Transactor(injectedProvider)
            tx({
              to: toAddress,
              value: ethers.utils.parseEther(""+amount),
            })
            setOpen(!open)
          }}>
            <SendOutlined /> Send
          </Button>,
        ]}
      >
        <div>
          <div style={inputStyle}>
            <EtherInput
              autoFocus={true}
              price={price}
              value={amount}
              onChange={(value)=>{
                setAmount(value)
              }}
            />
          </div>
          <div style={inputStyle}>
            <AddressInput
              ensProvider={mainnetProvider}
              placeholder="to address"
              value={toAddress}
              onChange={setToAddress}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default App;



function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
