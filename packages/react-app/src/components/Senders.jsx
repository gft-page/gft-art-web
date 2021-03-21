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
      twitterUsers: '',
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
      customMarketplace: '',
      marketplaceAlert: '',
      isApproved: true
    }

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

  handleTwitterUsersChange = event => {
    console.log(event.target.value)
  }

  handleAddressesChange = event => {
    let addressArray = event.target.value.split('\n')
    let newAddresses = []
    addressArray.forEach((address, index) => {
      let addressData = address.split(',')
      let newHash = {
        address: addressData[0],
        tokenNumber: addressData[1]
      }
      newAddresses.push(newHash)
    })
    this.setState({
      addresses: [...newAddresses]
    })
    //console.log(this.state.addresses)
  }

  handleTwitterUsersChange = event => {
    //twitterUsersTextarea: '',
    //twitterUsers: []
    let twitterUsersArray = event.target.value.split('\n')
    let newTwitterUsers = []
    twitterUsersArray.forEach((twitterUser, index) => {
      let addressData = twitterUser.split(',')
      let newHash = {
        username: addressData[0],
        tokenNumber: addressData[1]
      }
      newTwitterUsers.push(newHash)
    })
    this.setState({
      twitterUsers: [...newTwitterUsers]
    })
    this.setState({
      twitterUsersTextarea: event.target.value
    })
  }

  handleTwitterUsersTokensChange = event => {
    let arrayIdx = event.target.id.split("_")[1]
    let newArray = [...this.state.checkedArray]
    newArray[arrayIdx].tokenNum = event.target.value
    this.setState({
      checkedArray: [...newArray]
    })
    console.log(this.state.checkedArray)
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


  handleCheckChange = event => {
    //console.log(this.state.twitterUsersTextarea)
    //console.log(event.target.value)
    //console.log(event.target.checked)
    let newSet = new Set()
    for (let item of this.state.checkedSet) newSet.add(item)
    if (newSet.has(event.target.value)) {
      newSet.delete(event.target.value)
    } else {
      newSet.add(event.target.value)
    }
    this.setState({
      checkedSet: newSet
    })
    let newCheckedArray = []
    let tempSetArray = Array.from(newSet)
    for (let item of tempSetArray) {
      let newItem = {
        username: item,
        tokenNum: 0
      }
      newCheckedArray.push(newItem)
    }
    this.setState({
      checkedArray: [...newCheckedArray]
    })
    //Now update the text area
    //twitterUsersTextarea: '',
    //twitterUsers: []

    let newTwitterUsers = []
    // Iterate through the twitterUsers array - anything in there that's NOT in checkedSet needs to go
    for (let item of this.state.twitterUsers) {
      if (this.state.checkedSet.has(item.username)) {
        newTwitterUsers.push(item)
      }
    }

    // Iterate through checkedSet - anything that's NOT in twitterUsers needs to be added

    // Recreate the textarea from the update twitterUsers array
    let newTextarea = ""

    for (let item of newTwitterUsers) {
      newTextarea = `${item.username}, ${item.tokenNumber}\n`
    }

    //console.log(newTextarea)

    this.setState({
      twitterUsers: [...newTwitterUsers]
    })
    //this.setState({
    //  twitterUsersTextarea: newTextarea
    //})       
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

    if (this.state.customMarketplace === '') {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

    //console.log(`provider: ${provider} nftContract: ${nftContract}`)
    let isApproved = await approve(provider, nftContract)
    console.log(isApproved)
  }

  handleGiftSubmit = async (event) => {
    console.log("In gift submit")
    /* data: [
        {
            tokenId: X,
            eth: [
                {recipient: "0x...", amount: 1 },
                ...
            ],
            twitter: [
                {recipient: "@...", amount: 1 },
                ...
            ]
        },
        ...
    }]
    */
    // overrideAmount = # of tokens you want to spend - only for Rarible 1155 or custom 
    const provider = await getProvider(this.props.web3Modal, console.error)
    let nftContract = ''

    if (this.state.customMarketplace === '') {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }
    let data = []
    let nftHash = {}
    nftHash['tokenId'] = this.state.tokenID
    let ethArray = []
    for (let item of this.state.addresses) {
      if (item.address != "") {
        let singleAddress = {
          recipient: item.address,
          amount: item.tokenNumber
        }
        ethArray.push(singleAddress)
      }
    }
    nftHash['eth'] = ethArray
    let twitterArray = []
    for (let item of this.state.checkedArray) {
      if (item.username != "") {
        let singleUser = {
          recipient: item.username,
          amount: item.tokenNum
        }
        twitterArray.push(singleUser)
      }
    }
    nftHash['twitter'] = twitterArray
    data.push(nftHash)
    console.log(data)
    gft1155NFTs(provider, nftContract, data, this.state.numTokens)
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
                {this.state.marketplace.includes("1155") ?
                  "Enter NFT token ID"
                  : null}
                {this.state.marketplace.includes("1155") ?
                  <Form.Item
                    onChange={this.handleChange} value={this.state.tokenID}
                    label=""
                    name="tokenID"
                  >
                    <Input name="tokenID" placeholder="For ex. 123456" style={{ width: '50%' }} />
                  </Form.Item>
                  : null}
                {this.state.marketplace.includes("1155") ?
                  "Enter # of tokens you want to send"
                  : null}
                {this.state.marketplace.includes("1155") ?
                  <Form.Item
                    onChange={this.handleChange} value={this.state.numTokens}
                    label=""
                    name="numTokens"
                  >
                    <Input name="numTokens" placeholder="1" style={{ width: '50%' }} />
                  </Form.Item>
                  : null}
                <strong>Send to recipients</strong>
                {this.state.marketplace.includes("1155") ?
                  <p>In each line, enter an address, # of tokens</p>
                  :
                  <p>In each line, enter an address, ID of token</p>}
                <Form.Item name={['user', 'introduction']} label="">
                  <Input.TextArea value={this.state.addressesTextarea} onChange={this.handleAddressesChange} placeholder="cvg8hrdfg8awfg5h18n904448fgjk984dt45113, 1 cvg8hrdfg8awfg5h18n904448fgjk984dt45113, 1" />
                </Form.Item>
                {this.state.marketplace.includes("1155") ?
                  <p>In each line, enter # of tokens</p>
                  :
                  <p>In each line, enter ID of token</p>}
                {
                  this.state.checkedArray.map((item, idx) => {
                    return <Row><Col><Form.Item onChange={this.handleTwitterUsersTokensChange} value={this.state.checkedArray[idx].tokenNum} label="" name={idx}><Input placeholder="1" style={{ width: '75%' }} /></Form.Item></Col><Col>{item.username}</Col></Row>
                  })
                }
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