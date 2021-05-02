import React from 'react'
import Container from 'react-bootstrap/Container'
import { message } from 'antd'

import Erc20Page from '../pages/Erc20Page'
import * as disperse from '../helpers/disperse'
import { getProvider } from '../helpers/network'

export default function Erc20Container(props) {
  const inputRef = React.useRef()

  const [provider, setProvider] = React.useState(null)
  const [canSubmit, setCanSubmit] = React.useState(false)
  const [isApproved, setIsApproved] = React.useState(false)
  const [isLoadingApprove, setIsLoadingApprove] = React.useState(false)
  const [isAlreadyApproved, setIsAlreadyApproved] = React.useState(false)
  const [tokenContractAddress, setTokenContractAddress] = React.useState('')
  const [totalAmount, setTotalAmount] = React.useState(0)
  const [directRecipients, setDirectRecipients] = React.useState([])
  const [twitterRecipients, setTwitterRecipients] = React.useState([])

  React.useEffect(setupProvider, [props.web3Modal])
  function setupProvider() {
    if (props.web3Modal && !provider) {
      async function run() {
        const _provider = await getProvider(props.web3Modal)
        setProvider(_provider)
      }
      run()
    }
  }

  function handleTokenInput(event) {
    const { value } = event.target
    console.log(value)
    if (value.length == 42) {
      setTokenContractAddress(value)
    }
  }

  function handleDirectRecipientsInput(event) {
    let _canSubmit = (tokenContractAddress) ? true : false
    setCanSubmit(_canSubmit)
    let _totalAmount = 0
    const _directRecipients = event.target.value.trim().split("\n").map(line => {
      const parsed = line.trim().replace(/(,|\s+|\t+)/g, ' ').split(' ')
      const address = parsed[0]
      if (address.length != 42) {
        message.error(`Invalid address: ${address}`)
        _canSubmit = false
      }
      const amount = parsed[1]
      _totalAmount += parseFloat(amount)
      return {
        address,
        amount,
        tokenId: -1
      }
    })
    setCanSubmit(_canSubmit)
    if (_canSubmit) {
      console.log(_directRecipients)
      setDirectRecipients(_directRecipients)
      console.log(_totalAmount)
      setTotalAmount(_totalAmount)
    }
  }

  async function handleApprove() {
    setIsLoadingApprove(true)

    let _isApproved = false
    try {
      _isApproved = await disperse.checkApproved(provider, tokenContractAddress, totalAmount)
      if (_isApproved) {
        setIsAlreadyApproved(true)
      } else {
        try {
          await disperse.approveTransfer(provider, tokenContractAddress, totalAmount)
          setIsApproved(true)
        } catch (error) {
          message.error(JSON.stringify(error))
        }
      }
    } catch (error) {
      message.error(JSON.stringify(error))
    }

    setIsLoadingApprove(false)
  }

  function handleSend() {
    disperse.disperseToken(provider, tokenContractAddress, {
      tokenContractAddress,
      direct: directRecipients,
      twitter: twitterRecipients
    })
  }

  return (
    <Container>
      <Erc20Page
        {...props}
        showApprovedButton={canSubmit}
        isLoadingApprove={isLoadingApprove}
        showSendButton={canSubmit}
        isApproved={isApproved}
        isAlreadyApproved={isAlreadyApproved}
        handleTokenInput={handleTokenInput}
        handleDirectRecipientsInput={handleDirectRecipientsInput}
        handleApprove={handleApprove}
        inputRef={inputRef}
      />
    </Container>
  )
}
