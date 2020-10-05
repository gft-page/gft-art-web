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

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>

        <div style={{margin:8}}>
          To:<Input value={to} onChange={(e)=>{setTo(e.target.value)}} />
          Value:<Input value={value}  onChange={(e)=>{setValue(e.target.value)}} />
          Data:<Input value={data} onChange={(e)=>{setData(e.target.value)}} />

          <Button onClick={async ()=>{

            let newHash = await readContracts.MetaMultiSigWallet.getTransactionHash(to,parseEther(value),data)
            console.log("newHash",newHash)

            let signature = await userProvider.send("personal_sign", [newHash, address]);
            console.log("signature",signature)

            let recover = await readContracts.MetaMultiSigWallet.recover(newHash,signature)
            console.log("recover",recover)

            // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY

          }}>Create</Button>

        </div>

      </div>

    </div>
  );
}
