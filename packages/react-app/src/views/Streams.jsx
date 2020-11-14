import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { InputNumber, Select, Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie, EtherInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, useLocalStorage } from "../hooks";
import { useBlockNumber } from "eth-hooks";
const axios = require('axios');
const { Option } = Select;

export default function Streams({contractName, ownerEvents, signaturesRequired, address, nonce, userProvider, mainnetProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, blockExplorer }) {

  //event OpenStream( address indexed to, uint256 amount, uint256 frequency );
  const openStreamEvents = useEventListener(readContracts, contractName, "OpenStream", localProvider, 1);
  console.log("📟 openStreamEvents:",openStreamEvents)

  const blockNumber = useBlockNumber(localProvider);
  console.log("# blockNumber:",blockNumber)

  const [streams, setStreams] = useState()
  const [streamBalances, setStreamBalances] = useState()
  useEffect(()=>{
      let getStreams = async ()=>{
        let newStreams = []
        let newStreamBalances = {}
        for(let s in openStreamEvents){
          if(newStreams.indexOf(openStreamEvents[s].to)<0){
            newStreams.push(openStreamEvents[s].to)
            newStreamBalances[openStreamEvents[s].to] = await readContracts[contractName].streamBalance(openStreamEvents[s].to)
          }
        }
        setStreams(newStreams)
        setStreamBalances(newStreamBalances)
      }
      getStreams()
    },[ openStreamEvents, blockNumber ]
  )

  const history = useHistory();

  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount","0");
  const [methodName, setMethodName] = useLocalStorage("openStream");
  const [streamToAddress, setStreamToAddress] = useLocalStorage("streamToAddress");
  const [streamAmount, setStreamAmount] = useLocalStorage("streamAmount");
  const [streamFrequency, setStreamFrequency] = useLocalStorage("streamFrequency");
  const [data, setData] = useLocalStorage("data","0x");

  let streamDetailForm = ""
  let displayedStream = {}
  if(methodName=="openStream"){
    streamDetailForm = (
      <div>
        <div style={{margin:8,padding:8}}>
          <EtherInput
            price={price}
            placeholder="amount"
            value={streamAmount}
            onChange={setStreamAmount}
          />
        </div>
        <div style={{margin:8,padding:8}}>
          every <InputNumber
            width={200}
            placeholder="frequency"
            value={streamFrequency}
            onChange={setStreamFrequency}
          /> seconds
        </div>
      </div>
    )
  }

  return (
    <div>
      <List
        style={{maxWidth:400,margin:"auto",marginTop:32}}
        bordered
        dataSource={streams}
        renderItem={(item) => {
          console.log("STREAM ITEM",item)

          let withdrawButtonOrBalance = ""
          if(address==item){
            withdrawButtonOrBalance = (
              <Button type="large" style={{paddingTop:-8}}>
                { "$" + (parseFloat(formatEther(streamBalances[item]?streamBalances[item]:0)) * price).toFixed(2) }
              </Button>
            )
          }else{
            withdrawButtonOrBalance = (
              <Balance
                balance={streamBalances[item]}
                dollarMultiplier={price}
              />
            )
          }

          return (
            <List.Item key={"stream_"+item}>
              <Address
                value={item}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
              {withdrawButtonOrBalance}
            </List.Item>
          )

        }}
      />

      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>
        <div style={{margin:8,padding:8}}>
          <Select value={methodName} style={{ width: "100%" }} onChange={ setMethodName }>
            <Option key="openStream">openStream()</Option>
            <Option key="closeStream">closeStream()</Option>
          </Select>
        </div>
        <div style={{margin:8,padding:8}}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="stream to address"
            value={streamToAddress}
            onChange={setStreamToAddress}
          />
        </div>
        {streamDetailForm}
        <div style={{margin:8,padding:8}}>
          <Button onClick={()=>{
            //console.log("METHOD",setMethodName)

            let calldata
            if(methodName=="openStream"){
              calldata = readContracts[contractName].interface.encodeFunctionData("openStream",[streamToAddress,parseEther(""+parseFloat(streamAmount).toFixed(12)),streamFrequency])
            }else{
              calldata = readContracts[contractName].interface.encodeFunctionData("closeStream",[streamToAddress])
            }
            console.log("calldata",calldata)
            setData(calldata)
            setAmount("0")
            setTo(readContracts[contractName].address)
            setTimeout(()=>{
              history.push('/create')
            },777)
          }}>
            Create Tx
          </Button>
        </div>
      </div>
    </div>
  );
}
