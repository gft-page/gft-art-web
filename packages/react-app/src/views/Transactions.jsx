import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { useContractReader, useEventListener } from "../hooks";


export default function ExampleUI({address, userProvider, mainnetProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts }) {

  const [to, setTo] = useState();
  const [value, setValue] = useState("0");
  const [data, setData] = useState("0x");

  const [hash, setHash] = useState();
  const [signature, setSignature] = useState();

  // keep track of a variable from the contract in the local React state:
  const signaturesRequired = useContractReader(readContracts,"MetaMultiSigWallet", "signaturesRequired")
  console.log("🤗 signaturesRequired:",signaturesRequired)

  //📟 Listen for broadcast events
  const depositEvents = useEventListener(readContracts, "MetaMultiSigWallet", "Deposit", localProvider, 1);
  console.log("📟 depositEvents events:",depositEvents)

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>
        <h3>example ui:</h3>
        <h2>signaturesRequired: {signaturesRequired?signaturesRequired.toNumber():<Spin/>}</h2>

        <Divider/>

        <div style={{margin:8}}>
          To:<Input value={to} onChange={(e)=>{setTo(e.target.value)}} />
          Value:<Input value={value}  onChange={(e)=>{setValue(e.target.value)}} />
          Data:<Input value={data} onChange={(e)=>{setData(e.target.value)}} />
          <pre>
          {writeContracts?writeContracts.Example.interface.encodeFunctionData("setStore(string)",["NICE"]):writeContracts}
          </pre>
          <pre>
          {writeContracts?writeContracts.MetaMultiSigWallet.interface.encodeFunctionData("addSigner(address,uint256)",["0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",2]):writeContracts}
          </pre>

          <Button onClick={async ()=>{


            let newHash = await readContracts.MetaMultiSigWallet.getTransactionHash(to,parseEther(value),data)
            console.log("newHash",newHash)

            setHash(newHash)

          }}>getHash</Button>

          {hash}

          <Button onClick={async ()=>{
            //console.log("newPurpose",newPurpose)
            /* look how you call setPurpose on your contract: */
            //tx( writeContracts.YourContract.setPurpose(newPurpose) )
            let signature = await userProvider.send("personal_sign", [hash, address]);
            console.log("signature",signature)

            let recover = await readContracts.MetaMultiSigWallet.recover(hash,signature)
            console.log("recover",recover)

            setSignature(signature)

          }}>Sign</Button>

          {signature}

          <Button onClick={async ()=>{

            console.log("EXEC",to, parseEther(value), data, [signature])
            let result = await writeContracts.MetaMultiSigWallet.executeTransaction(to, parseEther(value), data, ["0xe9a13984c981a0be8426b8ed4a09024d28123f9df831ea237d9dc1dc8093b7dd6dddb33bfd3e867da55cef3d72a0dbde0b1ba918aaec2a34b0817663961ab3661c","0x29c4185a76c691aae38f4e1413335af4f184dd7f66283f2ac51533b3e24a8b7d60e3a130f759ef821b56055750f277d2389bacccad3434d603de48d2dc9811091b"])
            console.log("result",result)
            
          }}>EXEC</Button>
        </div>


        <Divider />

        Your Address:
        <Address
            value={address}
            ensProvider={mainnetProvider}
            fontSize={16}
        />

        <Divider/>

        {  /* use formatEther to display a BigNumber: */ }
        <h2>Your Balance: {yourLocalBalance?formatEther(yourLocalBalance):"..."}</h2>

        OR

        <Balance
          address={address}
          provider={localProvider}
          dollarMultiplier={price}
        />

        <Divider/>


        {  /* use formatEther to display a BigNumber: */ }
        <h2>Your Balance: {yourLocalBalance?formatEther(yourLocalBalance):"..."}</h2>

        <Divider/>

        <div style={{margin:8}}>
          <Button onClick={()=>{
            /* look how you call setPurpose on your contract: */
            tx( writeContracts.YourContract.setPurpose("🍻 Cheers") )
          }}>Set Purpose to "🍻 Cheers"</Button>
        </div>

        <div style={{margin:8}}>
          <Button onClick={()=>{
            /*
              you can also just craft a transaction and send it to the tx() transactor
              here we are sending value straight to the contract's address:
            */
            tx({
              to: writeContracts.YourContract.address,
              value: parseEther("0.001")
            });
            /* this should throw an error about "no fallback nor receive function" until you add it */
          }}>Send Value</Button>
        </div>

        <div style={{margin:8}}>
          <Button onClick={()=>{
            /* look how we call setPurpose AND send some value along */
            tx( writeContracts.YourContract.setPurpose("💵 Paying for this one!",{
              value: parseEther("0.001")
            }))
            /* this will fail until you make the setPurpose function payable */
          }}>Set Purpose With Value</Button>
        </div>


        <div style={{margin:8}}>
          <Button onClick={()=>{
            /* you can also just craft a transaction and send it to the tx() transactor */
            tx({
              to: writeContracts.YourContract.address,
              value: parseEther("0.001"),
              data: writeContracts.YourContract.interface.encodeFunctionData("setPurpose(string)",["🤓 Whoa so 1337!"])
            });
            /* this should throw an error about "no fallback nor receive function" until you add it */
          }}>Another Example</Button>
        </div>

      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <List
          bordered
          dataSource={depositEvents}
          renderItem={item => (
            <List.Item>
              {JSON.stringify(item)}
            </List.Item>
          )}
        />
      </div>


      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:256 }}>

        <Card>

          Check out all the <a href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components" target="_blank" >📦  components</a>

        </Card>

        <Card style={{marginTop:32}}>

          <div>
            There are tons of generic components included from <a href="https://ant.design/components/overview/" target="_blank" >🐜  ant.design</a> too!
          </div>

          <div style={{marginTop:8}}>
            <Button type="primary">
              Buttons
            </Button>
          </div>

          <div style={{marginTop:8}}>
            <SyncOutlined spin />  Icons
          </div>

          <div style={{marginTop:8}}>
            Date Pickers?
            <div style={{marginTop:2}}>
              <DatePicker onChange={()=>{}}/>
            </div>
          </div>

          <div style={{marginTop:32}}>
            <Slider range defaultValue={[20, 50]} onChange={()=>{}}/>
          </div>

          <div style={{marginTop:32}}>
            <Switch defaultChecked onChange={()=>{}} />
          </div>

          <div style={{marginTop:32}}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{marginTop:32}}>
            <Spin />
          </div>


        </Card>




      </div>


    </div>
  );
}
