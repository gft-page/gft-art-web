import React, { Component, useEffect, useState } from 'react';
import { QuestionCircleOutlined, TwitterOutlined } from '@ant-design/icons';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { needle } from 'needle';
import SenderTabs from './SenderTabs';

import { gft1155NFTs, gft721NFTs, approve, checkApproved } from "../helpers/index";

import "antd/dist/antd.css";
import { Tooltip, Form, Input, Select, InputNumber, Radio, Button, Checkbox, Row, Col, Divider, Card, message } from "antd";


import { ethers, providers } from "ethers";
import SenderNFTForm from "./SenderNFTForm";

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
      marketplaceCheckPending: false,
      marketplaceAlert: '',
      isApproved: true,
      value: 0,
      provider: null,
      selectIsOpen: false
    }
  }

  componentDidMount() {
    getProvider(this.props.web3Modal, console.error).then((provider) => {
      provider && this.setState({ provider });
    });
  }

  using721 = () => {
    return this.state.marketplace && this.state.marketplace.includes('721') || this.state.marketplace == "ZORA"
  }

  getTweets = (ID) => {
    fetch(`https://api.gft.art/api/v1/twitter/${ID}/replies?limit=50`)
      .then(resp => resp.json())
      .then(json => this.processReplies(json))

    return "@NFTgirl My first NFT sale was my genesis piece on @KnownOrigin_io picked up my the OG himself @j1mmyeth - it's the intro to my animation reel and a personal favorite of mine. Also happened the same day Biden was projected to win the election. So it was a very good day \uD83D\uDE42"
  }

  processReplies = (json) => {
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

  handleAddressesChange = event => {
    const addresses = event.target.value.trim().split("\n").map(l =>
      l.trim().replace(/,/g, " ").replace(/\s\s+/g, ' ').split(" ")
    ).filter(l => l && l.length > 0);
    this.setState({ addresses: addresses });
  }

  handleSelectChange = event => {
    this.setState({
      selectIsOpen: false,
      marketplace: event,
      selectIsLoading: true
    }, () => {
      if (!this.state.marketplace.includes('CUSTOM')) {
        this.handleMarketplaceCheck(event);
      }
    });
  }

  handleCustomMarketplaceChange = event => {
    if (this.state.marketplace.includes('CUSTOM') && this.state.customMarketplace.length > 0) {
      this.handleMarketplaceCheck(event);
    }
  }

  handleTwitterUsersValueChange = event => {
    const old = this.state.twitterMap ? { ... this.state.twitterMap } : {}
    old[(event.target.id.split("_")[1]).toLowerCase()] = event.target.value
    this.setState({ twitterMap: old })
  }

  handleCheckChange = event => {

    console.log(event.target.value)
    console.log(event.target.checked)

    const old = this.state.twitterMap ? { ... this.state.twitterMap } : {}

    if (event.target.checked) {
      old[event.target.value.toLowerCase()] = "DEFAULT"
    } else {
      delete old[event.target.value.toLowerCase()]
    }


    this.setState({ twitterMap: old })

  }

  handleMarketplaceCheck = async (event) => {
    this.setState({ marketplaceCheckPending: true });

    let nftContract = '';
    console.log(this.state.marketplace.includes("CUSTOM"));
    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace;
    } else {
      nftContract = this.state.customMarketplace;
    }

    console.log(`handleMarketplaceCheck nftContract: ${nftContract}`);

    try {
      let isApproved = await checkApproved(this.state.provider, nftContract);
      console.log(isApproved);
      this.setState({ isApproved: isApproved.approved });
      if (!isApproved.approved && isApproved.error) {
        this.setState({ marketplaceAlert: String(isApproved.error) });
      } else {
        this.setState({ marketplaceAlert: '' });
      }
    } catch (err) {
      message.error('Please connect your wallet first');
    }
    this.setState({ marketplaceCheckPending: false });
  }

  handleMarketplaceSubmit = async (event) => {
    let nftContract = ''

    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

    let isApproved = await approve(this.state.provider, nftContract)
    console.log(isApproved)
  }

  handleGiftSubmit = async (event) => {
    let nftContract = ''

    if (!this.state.marketplace.includes("CUSTOM")) {
      nftContract = this.state.marketplace
    } else {
      nftContract = this.state.customMarketplace
    }

    let data;

    if (this.using721()) {
      data = {
        eth: this.state.addresses.map(a => ({ recipient: a[0], tokenId: a[1] })),
        twitter: Object.keys(this.state.twitterMap).map(user => ({ recipient: user, tokenId: this.state.twitterMap[user] }))
      }
    } else {
      const num = this.state.numTokens
      const defNum = num && num == parseInt(num) ? parseInt(num) : 1
      data = [{
        tokenId: this.state.tokenID,
        eth: this.state.addresses.map(a => ({ recipient: a[0], amount: a[1] && a[1] == parseInt(a[1]) ? parseInt(a[1]) : defNum || 1 })),
        twitter: Object.keys(this.state.twitterMap).map(user => {
          const amt = this.state.twitterMap[user]
          return { recipient: user, amount: amt && amt == parseInt(amt) ? parseInt(amt) : (defNum || 1) }
        })
      }]
    }


    console.log("][][][][][][][][][][")
    console.log("using721", this.using721())
    console.log(data)

    if (this.using721()) {
      gft721NFTs(this.state.provider, nftContract, data, this.state.value)
    } else {
      gft1155NFTs(this.state.provider, nftContract, data, this.state.value)
    }
  }

  handleValueChange = (event) => {
    this.setState({ value: event.target.value });
  }

  handleSelectClick = () => {
    if (!this.checkConnected()) {
      this.setState({ selectIsOpen: false });
    } else {
      this.setState({ selectIsOpen: !this.state.selectIsOpen })
    }
  }

  checkConnected = () => {
    if (!this.state.provider) {
      message.error('Please connect your web3 wallet');
      return false;
    }
    return true;
  }

  render() {
    return (
      <div>
        <h1><small><strong>Send multiple NFTs all at once ✨</strong></small></h1>
        <Jumbotron>
          <h5>
            <strong>Select the protocol or marketplace your NFTs are listed on</strong>
          </h5>
          <Form
            onSubmit={event => this.handleMarketplaceSubmit(event)}
            name="marketplace"
            layout="inline"
          >
            <Form.Item
              name="select"
              label=""
            >
              <Select
                value={this.state.marketplace}
                onClick={this.handleSelectClick}
                onChange={this.handleSelectChange}
                placeholder="Please select a marketplace"
                open={this.state.selectIsOpen}
                loading={this.state.marketplaceCheckPending}
                style={{ width: "200px" }}
              >
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
                <Input name="customMarketplace" placeholder="Enter custom NFT contract address" style={{ minWidth: "350px" }} onChange={this.handleCustomMarketplaceChange} onKeyPress={this.handleCustomMarketplaceChange} onClick={this.handleCustomMarketplaceChange} onBlur={this.handleCustomMarketplaceChange} />
              </Form.Item>
              : null}
            {!this.state.isApproved ?
              <>
                <Button type="primary" onClick={event => this.handleMarketplaceSubmit(event)}>Approve NFT Transfer</Button>
                <br></br>
                {this.state.marketplaceAlert}</>
              : null}
          </Form>
          <br />
          <br />
          <Row gutter={16}>
            <Col className="gutter-row" span={11}>
              <div>
                <h5>
                <TwitterOutlined
                  style={{
                    position: "absolute",
                    marginTop: "-8px",
                    marginLeft: "-12px",
                    color: "yellow"
                  }}
                />
                  <strong>Send to people from a tweet</strong>
                </h5>
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
                    <Input placeholder="https://twitter.com/codevaltweets/status/1375804732237824001" />
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
              </div>
            </Col>
            <Col className="gutter-row" span={13}>
              <div>
                <Form
                  onSubmit={event => this.handleGiftSubmit(event)}
                  name="gift"
                  style={{ textAlign: "right" }}
                >
                  <SenderTabs
                    form={
                    <div style={{ padding: "50px", textAlign: "left" }}>
                      <SenderNFTForm
                        handleAddressesChange={this.handleAddressesChange}
                        handleChange={this.handleChange}
                        handleGiftSubmit={this.handleGiftSubmit}
                        handleTwitterUsersValueChange={this.handleTwitterUsersValueChange}
                        handleValueChange={this.handleValueChange}
                        using721={this.using721}
                        tokenID={this.state.tokenID}
                        numTokens={this.state.numTokens}
                        addressesTextarea={this.state.addressesTextarea}
                        twitterMap={this.state.twitterMap}
                        value={this.state.value}
                      />
                      <Form.Item
                        onChange={this.handleValueChange}
                        label={
                          <strong>
                          Add ETH to subsidize gas &nbsp;
                          <Tooltip title="Transferring an NFT costs some gas. You can enter an amount of ETH to be split up equally between your recipients to subsidize their gas costs.">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </strong>
                        }
                        value={this.value}
                        style={{ marginBottom: 2 }}
                      >
                        <Input placeholder="0 ETH" style={{ width: '100px' }} />
                      </Form.Item>
                    </div>
                  }
                  />
                  <Button
                    type="primary"
                    onClick={event => this.handleGiftSubmit(event)}
                    size="large"
                    style={{
                      marginTop: "30px",
                      borderRadius: "0px",
                      width: "33%"
                    }}
                  >
                      Send NFTs
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Jumbotron>
      </div>
    )
  }
}

async function getProvider(web3Modal, setError) {
  if (!web3Modal || !web3Modal.cachedProvider) {
    setError("provider not set");
    return;
  }
  return new providers.Web3Provider(await web3Modal.connect());
}

export default connect(null)(Senders);
