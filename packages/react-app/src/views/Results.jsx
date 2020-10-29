import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { useEventListener } from "../hooks";
import { List, Button, Card } from "antd";
import { Address, Balance } from "../components";
import { ethers } from "ethers";


export default function Results({ tx, clrBalance, roundFinish, address, writeContracts, recipientAddedEvents, mainnetProvider, blockExplorer, readContracts, localProvider, price }) {

  const [ payouts, setPayouts ] = useState()


  const distributeEvents = useEventListener(readContracts, "MVPCLR", "Distribute", localProvider, 1);
  console.log("📟 distributeEvents:",distributeEvents)


  let payoutDisplay = []

  if(payouts){
    //console.log("payouts",payouts)
    for(let p in payouts){
      //console.log("payouts p ",p,payouts[p])

      let found = []
      for(let e in distributeEvents){
        if(distributeEvents[e].index.eq(p)){
          found.push(distributeEvents[e])
        }
      }
      console.log("FOUND",found)
      if(found&&found.length>0){
        payoutDisplay.push(
          <List
            style={{marginBottom:32}}
            bordered
            size="large"
            dataSource={found}
            renderItem={(item)=>{
              return (
                <List.Item>
                  <div style={{color:"#95de64"}}>
                    <Balance
                      balance={item.amount}
                      dollarMultiplier={price}
                    />
                  </div>
                  <Address
                    value={item.to}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                </List.Item>
              )
            }}
          />
        )
      }else{
        payoutDisplay.push(
          <div>
            <Card title={payouts[p].title} style={{marginBottom:32}}>
              <Balance
                balance={payouts[p].payout}
                dollarMultiplier={price}
              />
              <Address
                value={payouts[p].address}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={16}
              />
              <div style={{opacity:roundFinish?1:0.1,marginTop:32}}>
                <Button type={"primary"} onClick={()=>{
                  /* tx({
                    to: payouts[p].address,
                    value: payouts[p].payout,
                  })*/
                  tx( writeContracts.MVPCLR.distribute(payouts[p].address,p,payouts[p].payout) )
                }}>
                  Send
                </Button>
              </div>
            </Card>

          </div>
        )
      }
    }

  }else{
    payoutDisplay = (
      <Button onClick={async ()=>{
          try {
            let recipients = await readContracts.MVPCLR.queryFilter(readContracts.MVPCLR.filters.RecipientAdded())
            let recipientByIndex = {}
            let addressByIndex = {}
            for(let r in recipients){
              const prettyName = ethers.utils.parseBytes32String(recipients[r].args.data)
              console.log(recipients[r].args.addr+" "+prettyName+" "+recipients[r].args.index)//value index
              recipientByIndex[recipients[r].args.index] = prettyName
              addressByIndex[recipients[r].args.index] = recipients[r].args.addr
            }
            let donations = await readContracts.MVPCLR.queryFilter(readContracts.MVPCLR.filters.Donate())
            console.log("There are a total of "+donations.length+" donations")
            let newPayouts = {}
            for(let d in donations){
              if(!newPayouts[donations[d].args.index]) newPayouts[donations[d].args.index] = ethers.BigNumber.from(0)
              newPayouts[donations[d].args.index] = newPayouts[donations[d].args.index].add(donations[d].args.value)
              console.log(donations[d].args.sender+" -> "+donations[d].args.value+" "+recipientByIndex[donations[d].args.index])//value index
            }
            console.log("newPayouts",newPayouts)
            let payoutsByAddress = []
            for(let p in newPayouts){
              console.log("newPayout:",p,newPayouts[p],addressByIndex)
              payoutsByAddress.push({
                title: recipientByIndex[p],
                index: p,
                address: addressByIndex[p],
                payout: newPayouts[p]
              })
            }
            console.log("payoutsByAddress",payoutsByAddress)
            setPayouts(payoutsByAddress)
          } catch (e) {
            console.log(e);
          }
      }}>
       🧮 Calc
      </Button>
    )
  }

  return (
    <div style={{width:500,margin:"auto"}}>

      <div style={{marginTop:32,marginLeft:64,marginRight:64,marginBottom:16,border:"1px solid #f8f8f8",backgroundColor:"#fbfbfb",padding:16,fontSize:16, fontWeight:"bold"}}>
        🏦 <Balance
          address={readContracts?readContracts.MVPCLR.address:readContracts}
          provider={localProvider}
          dollarMultiplier={price}
        />
      </div>


      <div style={{width:500,margin:"auto",paddingBottom:128,padding:64}}>
        {payoutDisplay}
      </div>
    </div>
  );
}
