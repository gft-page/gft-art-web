import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { needle } from 'needle'

import { gft1155NFTs, gft721NFTs, approve, checkApproved } from "../helpers/index";

import "antd/dist/antd.css";
import { Form, Input, Select, InputNumber, Radio, Button, Checkbox, Row, Col, Divider, Card } from "antd";

import { ethers, providers } from "ethers";

const style = { padding: '8px 0' };

const { Option } = Select;



class Senders extends React.Component {

  constructor() {
    super()
    this.state = {
      tweetURL: '',
      tweetContent: '',
      checkedSet: new Set(),
      checkedArray: [],
      replies: [],
      marketplace: '',
      tokenID: '',
      numTokens: '',
      addressesTextarea: '',
      addresses: [],
      twitterUsersTextarea: '',
      twitterUsers: [],
      twitterMap: {},
      customMarketplace: '',
      marketplaceAlert: '',
      isApproved: true,
      data: undefined
    }

  }


  using721() {
    return this.state.marketplace && this.state.marketplace.includes('721') || this.state.marketplace == "ZORA"
  }


  getTweets(ID) {
    fetch(`https://api.gft.art/api/v1/twitter/${ID}/replies?limit=50`)
      .then(resp => resp.json())
      .then(json => this.processReplies(json))

    return "@NFTgirl My first NFT sale was my genesis piece on @KnownOrigin_io picked up my the OG himself @j1mmyeth - it's the intro to my animation reel and a personal favorite of mine. Also happened the same day Biden was projected to win the election. So it was a very good day \uD83D\uDE42"
  }



  processReplies(json) {
    console.log(json.usernames)
    let newReplies = []
    let newTwitterCard = ''
    let idSet = new Set()
    json.usernames.forEach((username, index) => {
      if (!idSet.has(username)) {
        idSet.add(username)
        let newHash = {
          author_id: username
        }
        newReplies.push(newHash)
        newTwitterCard += `<p>${username}</p>\n`
      }
    })
    this.setState({
      replies: [...newReplies]
    })
    this.setState({
      twitterUsers: newTwitterCard
    })
    //console.log(newTwitterCard)
    //this.state.replies = [...newReplies]
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
    if (event.target.value.includes("https://twitter.com")) {
      // This is a tweet
      const urlComponents = event.target.value.split('/')
      if (urlComponents.length === 6) {
        let tweetContent = this.getTweets(urlComponents[5])
        tweetContent = tweetContent.substring(0, 50) + "..."
        this.state.tweetContent = tweetContent
      }
    }
  }

  // handleTwitterUsersChange = event => {
  //   console.log(event.target.value)
  // }

  handleAddressesChange = event => {

    const addresses = event.target.value.trim().split("\n").map(l =>
      l.trim().replace(/,/g, " ").replace(/\s\s+/g, ' ').split(" ")
    ).filter(l => l && l.length > 0)

      this.setState({addresses: addresses})
  }




  handleSelectChange = event => {
    this.setState({
      marketplace: event
    })
    setTimeout(() => {
      if (!this.state.marketplace.includes('CUSTOM')) {
        this.handleMarketplaceCheck(event)
      }
    }, 100)
  }

  handleCustomMarketplaceChange = event => {

    if (this.state.marketplace.includes('CUSTOM') && this.state.customMarketplace.length > 0) {
      this.handleMarketplaceCheck(event)
    }

  }


  handleTwitterUsersValueChange = event => {



    const old =  this.state.twitterMap ? {... this.state.twitterMap} : {}
  old[(event.target.id.split("_")[1]).toLowerCase()] = event.target.value
    

  this.setState({twitterMap: old})


  }

  handleCheckChange = event => {
    
    console.log(event.target.value)
    console.log(event.target.checked)
    
    const old =  this.state.twitterMap ? {... this.state.twitterMap} : {}
   
    if (event.target.checked) {
      old[event.target.value.toLowerCase()] = "DEFAULT"
    }else {
      delete old[event.target.value.toLowerCase()]
    }


  this.setState({twitterMap: old})

  }

  handleMarketplaceCheck = async (event) => {
    const provider = await getProvider(this.props.web3Modal, console.error)
    let nftContract = ''
    console.log(this.state.marketplace.includes("CUSTOM"))
    // if (this.state.customMarketplace === '') {
    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

    console.log(`handleMarketplaceCheck nftContract: ${nftContract}`)

    let isApproved = await checkApproved(provider, nftContract)
    console.log(isApproved)
    this.setState({ isApproved: isApproved.approved })

    if (!isApproved.approved) {
      this.setState({
        marketplaceAlert: String(isApproved.error) || 'Please make sure your wallet is connected and has a balance'
      })
    }
  }

  handleMarketplaceSubmit = async (event) => {
    const provider = await getProvider(this.props.web3Modal, console.error)
    let nftContract = ''

    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

    let isApproved = await approve(provider, nftContract)
    console.log(isApproved)
  }

  handleGiftSubmit = async (event) => {
    const provider = await getProvider(this.props.web3Modal, console.error)
    let nftContract = ''

    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

   let data;

    if (this.using721()) {
            data = {}
    }else {
      const num = this.state.numTokens
      const defNum = num && num == parseInt(num) ? parseInt(num) : 1
            data = [{
              tokenId: this.state.tokenID,
              eth: this.state.addresses.map(a => ({recipient:a[0], amount: a[1] && a[1] == parseInt(a[1]) ? parseInt(a[1]) : defNum || 1 })),
              twitter: Object.keys(this.state.twitterMap).map(user => {
                const amt = this.state.twitterMap[user]
                return {recipient:user, amount: amt && amt == parseInt(amt) ? parseInt(amt) : (defNum || 1)  }
              })
            }]
    }


    console.log("][][][][][][][][][][")
    console.log("using721", this.using721())
    console.log(data)

    if (this.using721()) {
    }else{
      gft1155NFTs(provider, nftContract, data)
    }
  }



  render() {
    return (
      <div>
        <h5 className="header"><strong>Gift an NFT to many, all at once ✨</strong></h5>
          Send an NFT to people from a tweet with @twitter-handles, an address, or both
        <br></br>
        <br></br>
        <Row gutter={16}>
          <Col className="gutter-row" span={11}>
            <div style={style}>
              <Card>
                <p>
                  <strong>Send to people from a tweet</strong>
                </p>
                <p>To send an NFT with someone’s @twitter-handle, paste the tweet link, and we’ll create an address book of @twitter-handles you can choose from.</p>
                <strong>Paste tweet link</strong>
                <Form
                  name="urlFORM"
                >
                  <Form.Item
                    onChange={this.handleChange} value={this.state.tweetURL}
                    label=""
                    name="tweetURL"
                    value="tweetURL"
                  >
                    <Input />
                  </Form.Item>
                </Form>
                {/*<p>{this.state.tweetContent}</p>*/}
                <p><strong>@Twitter-handle Address Book</strong></p>
                <p>We found <b>{this.state.replies.length} twitter handles</b></p>
                <Form
                  name="twitterAddresses"
                >
                  <p>Usernames</p>
                  <Form.Item name="checkbox-group" label="">
                    <Checkbox.Group>
                      {
                        this.state.replies.map((item) => {
                          return <Row><Col><Checkbox onChange={this.handleCheckChange} value={item.author_id}></Checkbox></Col><Col>{item.author_id}</Col></Row>
                        })
                      }
                    </Checkbox.Group>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          </Col>
          <Col className="gutter-row" span={13}>
            <div style={style}>
              <strong>Select the protocol or marketplace your NFT is listed on</strong>
              <Form
                onSubmit={event => this.handleMarketplaceSubmit(event)}
                name="marketplace"
              >
                <Form.Item
                  name="select"
                  label=""
                >
                  <Select value={this.state.marketplace} onChange={this.handleSelectChange} placeholder="Please select a marketplace">
                    <option value="ZORA">Zora</option>
                    <option value="RARIBLE_721">Rarible 721</option>
                    <option value="RARIBLE_1155">Rarible 1155</option>
                    <option value="CUSTOM_721">Custom 721 Address</option>
                    <option value="CUSTOM_1155">Custom 1155 Address</option>
                  </Select>
                </Form.Item>
                {this.state.marketplace.includes("CUSTOM") ?
                  <Form.Item
                    onChange={this.handleChange} value={this.state.customMarketplace}
                    label=""
                    name="customMarketplace"
                  >
                    <Input name="customMarketplace" placeholder="Enter custom NFT contract address" style={{ width: '50%' }} onChange={this.handleCustomMarketplaceChange} />
                  </Form.Item>
                  : null}
                {!this.state.isApproved ?
                  <>
                    <Button type="primary" onClick={event => this.handleMarketplaceSubmit(event)}>Approve NFT Transfer</Button>
                    <br></br>
                    {this.state.marketplaceAlert}</>
                  : null}


              </Form>
              <br></br>
              <Form
                onSubmit={event => this.handleGiftSubmit(event)}
                name="gift"
              >
                {!this.using721() ?
                  "Enter NFT token ID"
                  : null}
                {!this.using721() ?
                  <Form.Item
                    onChange={this.handleChange} value={this.state.tokenID}
                    label=""
                    name="tokenID"
                  >
                    <Input name="tokenID" placeholder="For ex. 123456" style={{ width: '50%' }} />
                  </Form.Item>
                  : null}


                {!this.using721() ?
                <>
                  Enter default # of tokens to send
                
                  <Form.Item
                    onChange={this.handleChange} value={this.state.numTokens}
                    label=""
                    name="numTokens"
                  >
                    <Input name="numTokens" placeholder="1" style={{ width: '50%' }} />
                  </Form.Item>
                  </>
                  : null}
                <strong>Send to recipients</strong>


                {!this.using721() ?
                  <p>On each line, enter: <tt>address, # of tokens to send</tt></p>
                  :
                  <p>On each line, enter: <tt>address, token ID</tt></p>}


                <Form.Item name={['user', 'introduction']} label="">
                  <Input.TextArea value={this.state.addressesTextarea} onChange={this.handleAddressesChange} placeholder={`0xb44f91949174fb47A7059A476A882447Fc6A08dD, 1
0xE2A5db9E741Cdf93e9C2eEA6e4247cA58Bf62024, 1`} />
                </Form.Item>


                {this.state.twitterMap && Object.keys(this.state.twitterMap).length ?
                  <>
                    {
                      !this.using721() ?
                        <p>For each twitter user, enter # of tokens to send</p>
                        :
                        <p>For each twitter user, enter ID of token</p>
                    }
                    {
                      // this.state.checkedArray.map((item, idx) => {
                      //   return <Row>
                      //     <Col>
                      //   <Form.Item onChange={this.handleTwitterUsersValueChange} value={this.state.checkedArray[idx].value} label="" name={idx} style={{marginBottom: 2}}>
                      //     <Input placeholder="1" style={{ width: '75%' }} />
                      //     </Form.Item></Col>
                      //     <Col>@{item.username}</Col>
                      //     </Row>
                      // })

                      Object.keys(this.state.twitterMap).map((username) => {
                        const val = this.state.twitterMap[username.toLowerCase()]
                        console.log(val)
                        return <Row>
                          <Col>
                        <Form.Item onChange={this.handleTwitterUsersValueChange}  label="" key={username} name={username} value={ val == "DEFAULT" ? "" : val} style={{marginBottom: 2}}>
                          <Input placeholder="1" style={{ width: '75%' }} />
                          </Form.Item></Col>
                          <Col>@{username}</Col>
                          </Row>
                      })
                    }
                  </> : null
                }
<br />

                <Button type="primary" onClick={event => this.handleGiftSubmit(event)}>Send NFTs</Button>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}


async function getProvider(web3Modal, setError) {
  if (!web3Modal || !web3Modal.cachedProvider) {
    setError("provider not set")
    return
  }



  return new providers.Web3Provider(await web3Modal.connect());
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Senders)