import React, { useState } from 'react'
import { ethers } from "ethers";

import { Card, Row, Col, List, Input, Button } from 'antd';
import { DownloadOutlined, UploadOutlined, CloseCircleOutlined, CheckCircleOutlined, RocketOutlined, SafetyOutlined } from '@ant-design/icons';
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance, useTimestamp } from "./hooks"
import { Transactor } from "./helpers"
import { Address, Balance, Timeline, Blockie } from "./components"
const { Meta } = Card;

const contractName = "SmartContractWallet"

export default function SmartContractWallet(props) {

  const tx = Transactor(props.injectedProvider,props.gasPrice)

  const localBlockNumber = useBlockNumber(props.localProvider)
  const localBalance = useBalance(props.address,props.localProvider)


  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);

  //const title = useContractReader(readContracts,contractName,"title",1777);
  const owner = useContractReader(readContracts,contractName,"owner",1777);

  const localTimestamp = useTimestamp(props.localProvider)
  const friendUpdates = useEventListener(readContracts,contractName,"UpdateFriend",props.localProvider,1);//set that last number to the block the contract is deployed (this needs to be automatic in the contract loader!?!)
  const isFriend = useContractReader(readContracts,contractName,"friends",[props.address],1777);
  const timeToRecover = useContractReader(readContracts,contractName,"timeToRecover",1777);

  const contractAddress = readContracts?readContracts[contractName].address:""
  const contractBalance = useBalance(contractAddress,props.localProvider)

  let display
  const [ friendAddress, setFriendAddress ] = useState("")

  const updateOwner = (newOwner)=>{
    tx(
       writeContracts['SmartContractWallet'].updateOwner(newOwner,
         { gasLimit: ethers.utils.hexlify(40000) }
       )
    )
  }

  const updateFriend = (isFriend)=>{
    return ()=>{
      tx(
         writeContracts['SmartContractWallet'].updateFriend(friendAddress, isFriend,
           { gasLimit: ethers.utils.hexlify(80000) }
         )
      )
      setFriendAddress("")
    }
  }

  let ownerDisplay = ""
  let cardActions = []
  if(props.address==owner){
    ownerDisplay = (
      <Row align="middle" gutter={4}>
        <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>Friend:</Col>
        <Col span={10}>
          <Input
            placeholder="address"
            prefix={<Blockie address={friendAddress} size={8} scale={3}/>}
            value={friendAddress}
            onChange={(e)=>{
              setFriendAddress(e.target.value)
            }}
          />
        </Col>
        <Col span={6}>
          <Button style={{marginLeft:4}} onClick={updateFriend(false)} shape="circle" icon={<CloseCircleOutlined />} />
          <Button style={{marginLeft:4}} onClick={updateFriend(true)} shape="circle" icon={<CheckCircleOutlined />} />
        </Col>
      </Row>
    )
    cardActions = [
        <div onClick={()=>{
          tx(
            writeContracts['SmartContractWallet'].withdraw(
              { gasLimit: ethers.utils.hexlify(40000) }
            )
          )
        }}>
          <UploadOutlined /> Withdraw
        </div>,
        <div onClick={()=>{
          tx({
            to: contractAddress,
            value: ethers.utils.parseEther('0.001'),
          })
        }}>
          <DownloadOutlined /> Deposit
        </div>,
    ]
  }

  if(isFriend){
    let recoverDisplay = (
      <Button style={{marginLeft:4}} onClick={()=>{
        tx(
           writeContracts['SmartContractWallet'].friendRecover(
             { gasLimit: ethers.utils.hexlify(80000) }
           )
        )
      }} shape="circle" icon={<SafetyOutlined />}/>
    )

    if(localTimestamp&&timeToRecover.toNumber()>0){
      const secondsLeft = timeToRecover.sub(localTimestamp).toNumber()
      if(secondsLeft>0){
        recoverDisplay = (
          <div>
            {secondsLeft+"s"}
          </div>
        )
      }else{
        recoverDisplay = (
          <Button style={{marginLeft:4}} onClick={()=>{
            tx(
               writeContracts['SmartContractWallet'].recover(
                 { gasLimit: ethers.utils.hexlify(80000) }
               )
            )
          }} shape="circle" icon={<RocketOutlined />}/>
        )
      }
    }

    ownerDisplay = (
      <Row align="middle" gutter={4}>
        <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>Recovery:</Col>
        <Col span={16}>
          {recoverDisplay}
        </Col>
      </Row>
    )
  }

  if(readContracts && readContracts[contractName]){
    display = (
      <div>
        <Row align="middle" gutter={4}>
          <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>Deployed to:</Col>
          <Col span={16}><Address value={contractAddress} /></Col>
        </Row>
        <Row align="middle" gutter={4}>
          <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>Owner:</Col>
          <Col span={16}><Address value={owner} onChange={updateOwner}/>
          </Col>
        </Row>
        {ownerDisplay}
      </div>
    )
  }

  return (
    <div>
      <Card
        title={(
          <div>
            📄 Smart Contract Wallet
            <div style={{float:'right',opacity:owner?0.77:0.33}}>
              <Balance
                address={contractAddress}
                provider={props.localProvider}
                dollarMultiplier={props.price}
              />
            </div>
          </div>
        )}
        size="large"
        style={{ width: 550, marginTop: 25 }}
        loading={!owner}
        actions={cardActions}>
          <Meta
            description={(
              <div>
                {display}
              </div>
            )}
          />
      </Card>
      <List
        style={{ width: 550, marginTop: 25}}
        header={<div><b>Friend Updates</b></div>}
        bordered
        dataSource={friendUpdates}
        renderItem={item => (
          <List.Item style={{ fontSize:22 }}>
            <Address value={item.friend}/> {item.isFriend?"✅":"❌"}
          </List.Item>
        )}
      />
      <div style={{position:'fixed',textAlign:'right',right:25,top:90,padding:10,width:"50%"}}>
        <h1><span role="img" aria-label="checkmark">✅</span> TODO LIST</h1>
        <Timeline
          localProvider={props.localProvider}
          address={props.address}
          chainIsUp={typeof localBlockNumber != "undefined"}
          hasOwner={typeof owner != "undefined"}
          isNotSmoort={ false }
          hasEther={parseFloat(localBalance)>0}
          contractAddress={contractAddress}
          contractHasEther={parseFloat(contractBalance)>0}
          amOwnerOfContract={owner===props.address}
        />
      </div>
    </div>
  );

}
