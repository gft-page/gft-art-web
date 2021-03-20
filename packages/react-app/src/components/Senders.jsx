import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import "antd/dist/antd.css";
import { Form, Input, Button, Checkbox, Row, Col, Divider, Card } from "antd";

import { ethers, providers } from "ethers";

const style = { padding: '8px 0' };

const APPROVAL_ABI = [
  { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
  { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }
]

const CONTRACT_ABI = [{ "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "distribute1155s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenIDs", "type": "uint256[]" }], "name": "distribute721s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "uint256", "name": "tokenID", "type": "uint256" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "distributeSame1155s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }]

const MAINNET = false

const CONTRACT_ADDRESS = MAINNET ? "0x0000000000000000000000000000000000000000"
  : "0xfd7bdd0ba917a32565de6da1b2c918a8a8feadb8"

const CONTRACT_PRESETS = MAINNET ? {
  "ZORA": "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
  "RARIBLE_1155": "0xd07dc4262BCDbf85190C01c996b4C06a461d2430",
  "RARIBLE_721": "0x60F80121C31A0d46B5279700f9DF786054aa5eE5",
  "CUSTOM": "CUSTOM"
} : {
  "ZORA": "0x7C2668BD0D3c050703CEcC956C11Bd520c26f7d4",
  "RARIBLE_1155": "0x2eBecaBBbe8a8C629b99aB23ed154d74CD5d4342",
  "RARIBLE_721": "0x509FD4cdAa29Be7B1fAD251d8Ea0fCA2Ca91eb60",
  "CUSTOM": "CUSTOM"
}

function getTweet(ID) {
  console.log(ID)
}

class Senders extends React.Component {

  constructor() {
    super()
    this.state = {
      tweetURL: '',
      contract: 'ZORA',
      contractCustom: '',
      contractApproved: false,
      sendType: 'ERC721',
      same1155TokenId: 0,
      recipients: ''
    }


    // console.log("===", this.props, this.provider)
  }

  getNFTContract() {
    return this.state.contract == ''
      ?
      null
      :
      this.state.contract === "CUSTOM"
        ?
        this.state.contractCustom
        :
        CONTRACT_PRESETS[this.state.contract]
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
    if (event.target.value.includes("https://twitter.com")) {
      // This is a tweet
      const urlComponents = event.target.value.split('/')
      if (urlComponents.length === 6) {
        getTweet(urlComponents[5])
      }
    }
    //console.log({ [event.target.name]: event.target.value })
  }

  handleSubmit = async (event) => {
    console.log("SUBMIT")


    event.preventDefault()

    const provider = await getProvider(this.props.web3Modal, console.error)
    if (!provider) return

    const nftContract = this.getNFTContract()
    const gftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());

    console.log("gftContract", gftContract)

    if (!this.state.recipients) return

    console.log(this.state.recipients)

    const recipients = this.state.recipients.trim().split("\n").map(l =>
      l.trim().replace(/,/g, " ").replace(/\s\s+/g, ' ').split(" ")
    )

    if (this.state.sendType === "ERC721") {
      const callRecipients = recipients.map(l => l[0])
      const callTokenIds = recipients.map(l => l[1])

      gftContract.distribute721s(nftContract, callRecipients, callTokenIds)
    } else if (this.state.sendType === "SAME_ERC1155") {
      const callRecipients = recipients.map(l => l[0])
      const callAmts = recipients.map(l => l[1])

      console.log("gftContract.distributeSame1155s(", nftContract, this.state.same1155TokenId, callRecipients, callAmts)

      gftContract.distributeSame1155s(nftContract, this.state.same1155TokenId, callRecipients, callAmts)

    } else if (this.state.sendType === "DIFFERENT_ERC1155S") {
      const callRecipients = recipients.map(l => l[0])
      const callTokenIds = recipients.map(l => l[1])
      const callAmts = recipients.map(l => l[2])
      gftContract.distribute1155s(nftContract, callRecipients, callTokenIds, callAmts)

    } else {
      //....
    }

  }

  render() {
    return (
      <div>
          <h5 className="header"><strong>Gift multiple NFTs to many, all at once ✨</strong></h5>
          Send an NFT to people from a tweet with @twitter-handles, an address, or both
          <br></br>
          <br></br>
          <h6><strong>Send 1 or more NFTs to people</strong></h6>
          <Row gutter={16}>
            <Col className="gutter-row" span={10}>
              <div style={style}>
                <Card>
                  <p>
                    <strong>Send to people from a tweet</strong>
                  </p>
                  <p>To send an NFT with someone’s @twitter-handle, paste the tweet link, and we’ll create an address book of @twitter-handles you can choose from.</p>
                  <br></br>                 
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
                </Card>
              </div>
            </Col>
            <Col className="gutter-row" span={14}>
              <div style={style}>
                <strong>Select the protocol or marketplace your NFT is listed on</strong>
              </div>
            </Col>
          </Row>     
      </div>
    )
  }
}


/*
//Uncomment once Ant is in
function Approval(props) {
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState("")


  function getContract(provider) {
    if (!props.contract || !props.contract || String(props.contract).slice(0, 2) != '0x' || props.contract.length < 42) {
      setError("invalid contract address")
      return
    }

    console.log("web3Modal", props.web3Modal, props.contract)


    return new ethers.Contract(props.contract, APPROVAL_ABI, provider.getSigner());
  }


  async function checkApproved() {
    const provider = await getProvider(props.web3Modal, setError)
    if (!provider) return

    console.log("provider", provider, ",,,,", provider._network)

    // const nftContract = new ethers.Contract(props.contract, APPROVAL_ABI, provider);
    const nftContract = getContract(provider)

    const account = (await provider.listAccounts())[0]

    let approved = false
    try {
      approved = await nftContract.isApprovedForAll(account, CONTRACT_ADDRESS)
    } catch (err) {
      setError(err)
      setApproved(approved)
      return
    }


    setApproved(approved)
    setError("")
  }

  useEffect(() => {
    checkApproved()
  }, [props])




  async function callSetApproval() {
    const provider = await getProvider(props.web3Modal, setError)
    if (!provider) return

    // const account = (await provider.listAccounts())[0]

    const nftContract = getContract(provider)

    try {
      await nftContract.setApprovalForAll(CONTRACT_ADDRESS, true)
      await checkApproved()
    } catch (err) {
      setError(err)
    }
  }


  if (error) {
    if (props.contract === "") return null
    return <div>  ERROR: {JSON.stringify(error)}</div>
  }

  return <div style={{ border: "1px solid #ccc", padding: '10px' }}>
    approved is {JSON.stringify(approved)} for contract: <br />
    {props.contract}
    <br />
    <br />
    {!approved ?
      <Button onClick={callSetApproval}>
        Approve
    </Button> : null
    }
  </div>

}
*/


async function getProvider(web3Modal, setError) {
  if (!web3Modal || !web3Modal.cachedProvider) {
    setError("provider not set")
    return
  }



  return new providers.Web3Provider(await web3Modal.connect());
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Senders)