import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance } from "../components";
import { useContractReader, useEventListener, useResolveName } from "../hooks";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers"

export default function BytesLand({ blockNumber, localProvider, translateBytes }) {

  const [ land, setLand ] = useState([])

  useEffect(()=>{
    if( blockNumber && localProvider ){
      const searchLand = async ()=>{
        console.log("🔭 SEARCHING BLOCK ",blockNumber)
        const block = await localProvider.getBlock(blockNumber)

        let nextArray = []
        let index = 0
        console.log(block)
        if(blockNumber>0){
          console.log("BLOCKHASH FOR",blockNumber,"IS",block.hash)
          let currentHash = block.hash

          while(index<1500){

              console.log("CURRENTHASH",currentHash)
              let splitHash = currentHash.replace("0x","")
              splitHash = splitHash.match(/.{1,4}/g)
              for(let s in splitHash){
                nextArray.push(translateBytes(splitHash[s]))
                index++
              }
              currentHash = ethers.utils.keccak256( currentHash )

          }

          setLand(nextArray)

        }

      }
      searchLand()
    }
  },[ blockNumber, setLand ])


  let display = []
  for(let l in land){
    if(land[l]){
      display.push(
        <div style={{position:"absolute",top:30*l}} onClick={()=>{
          console.log("LANDCLICK",blockNumber,l)
        }}>
          {land[l]}
        </div>
      )
    }
  }

  return (
    <div style={{width:30,border:"1px solid #999999",height:2560,backgroundColor:"#eeeeee"}}>
      <div>{blockNumber}</div>
      {display}
    </div>
  );
}
