import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'

import { ethers, providers } from "ethers";


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
    console.log({ [event.target.name]: event.target.value })
  }

  handleTweetSubmit = async (event) => {
    console.log(this.tweetURL)
    event.preventDefault()
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
        <h1><small>Senders Title</small></h1>
        <div>
          <Form onSubmit={event => this.handleTweetSubmit(event)}> 
          <Form.Group controlId="formTweetURL">
              <Form.Label>Tweet URL</Form.Label>
              <Form.Control name="tweetURL" type="text" onChange={this.handleChange} value={this.state.tweetURL} placeholder="Address for tweet to import replies from" />
            </Form.Group>          
            <Button variant="primary" type="submit">
                Submit
            </Button>
          </Form>                            
        </div>
        <p></p>
        <div>
          <Form onSubmit={event => this.handleSubmit(event)}>
            <Form.Group controlId="formContractAddress">
              <Form.Label>NFT Contract</Form.Label>
              {/* <Form.Control name="email" type="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email} /> */}
              <Form.Control name="contract" as="select" onChange={this.handleChange} value={this.state.contract} custom>
                <option value="ZORA">Zora</option>
                <option value="RARIBLE_721">Rarible 721</option>
                <option value="RARIBLE_1155">Rarible 1155</option>
                <option value="CUSTOM">Custom Address</option>
              </Form.Control>
            </Form.Group>

            {this.state.contract === "CUSTOM" ?
              <Form.Group controlId="formContractAddressCustom">
                <Form.Control name="contractCustom" type="text" placeholder="Enter custom NFT contract address" onChange={this.handleChange} value={this.state.contractCustom} />
              </Form.Group>
              : null}

            <Approval
              web3Modal={this.props.web3Modal}
              contract={this.getNFTContract()}
            />
            <br />
            <Form.Group controlId="formSendType">
              <Form.Label>Send Type</Form.Label>
              {/* <Form.Control name="email" type="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email} /> */}


              <Form.Control name="sendType" as="select" onChange={this.handleChange} value={this.state.sendType} custom>
                <option value="ERC721">ERC721</option>
                <option value="SAME_ERC1155">Same ERC1155</option>
                <option value="DIFFERENT_ERC1155S">Different ERC1155s</option>
              </Form.Control>
            </Form.Group>

            {this.state.sendType === 'SAME_ERC1155' ?
              <Form.Group controlId="formSameErc1155TokenId">
                <Form.Label>ERC1155 Token ID</Form.Label>
                <Form.Control name="same1155TokenId" type="number" placeholder="Enter token ID for ERC1155" onChange={this.handleChange} value={this.state.same1155TokenId} />
              </Form.Group>
              :
              null}





            {/* <Form.Group controlId="formBasicCheckbox">
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Check this switch"
              />
            </Form.Group> */}


            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Recipients</Form.Label>

              {this.state.sendType && <div>{
                this.state.sendType === 'SAME_ERC1155'
                  ?
                  <>(format: <tt>recipient, amount</tt>)</>
                  :
                  this.state.sendType === 'DIFFERENT_ERC1155S' ?
                    <>(format: <tt>recipient, token_id, amount</tt>)</>
                    :
                    this.state.sendType === 'ERC721' ?
                      <>(format: <tt>recipient, token_id</tt>)</>
                      :
                      "invalid send type"
              }
              </div>}

              <Form.Control as="textarea" rows={3} name="recipients" onChange={this.handleChange} value={this.state.recipients} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
                </Button>
          </Form>
        </div>
      </div>
    )
  }
}


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


async function getProvider(web3Modal, setError) {
  if (!web3Modal || !web3Modal.cachedProvider) {
    setError("provider not set")
    return
  }



  return new providers.Web3Provider(await web3Modal.connect());
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Senders)