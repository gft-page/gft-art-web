import React from 'react'
import { message } from 'antd'
import { BigNumber } from 'ethers'
import Container from 'react-bootstrap/Container'

import Erc20Page from '../pages/Erc20Page'
import * as disperse from '../helpers/disperse'
import { getProvider, MAINNET, RINKEBY } from '../helpers/network'
import { formatUnits } from 'ethers/lib/utils'

export default function Erc20Container(props) {
  const inputRef = React.useRef()

  const [etherscanHost, setEtherscanHost] = React.useState(null)
  const [provider, setProvider] = React.useState(null)
  const [isApproved, setIsApproved] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)
  const [isLoadingTokenInput, setIsLoadingTokenInput] = React.useState(false)
  const [isLoadingApprove, setIsLoadingApprove] = React.useState(false)
  const [isLoadingSend, setIsLoadingSend] = React.useState(false)
  const [isAlreadyApproved, setIsAlreadyApproved] = React.useState(false)
  const [isValidToken, setIsValidToken] = React.useState(false)
  const [isValidRecipients, setIsValidRecipients] = React.useState(false)
  const [tokenContractAddress, setTokenContractAddress] = React.useState('')
  const [tokenDecimals, setTokenDecimals] = React.useState(null)
  const [totalAmount, setTotalAmount] = React.useState(BigNumber.from('0'))
  const [directRecipients, setDirectRecipients] = React.useState([])
  const [twitterRecipients, setTwitterRecipients] = React.useState([])
  const [approvedTxHash, setApprovedTxHash] = React.useState(null)
  const [sentTxHash, setSentTxHash] = React.useState(null)

  React.useEffect(setupProvider, [props.web3Modal])
  function setupProvider() {
    if (props.web3Modal && !provider) {
      async function run() {
        try {
          const _provider = await getProvider(props.web3Modal)
          setProvider(_provider)
        } catch (error) {
          console.error(error)
        }
      }
      run()
    }
  }

  React.useEffect(setupEtherscanHost, [props.network])
  function setupEtherscanHost() {
    if (props.network) {
      switch (props.network) {
        case MAINNET:
          setEtherscanHost('https://etherscan.io')
          break
        case RINKEBY:
          setEtherscanHost('https://rinkeby.etherscan.io')
          break
        default:
          console.warn('Failed to set etherscan host. No network detected.')
          break
      }
    }
  }

  async function handleTokenInput(event) {
    setIsLoadingTokenInput(true)

    const { value } = event.target
    if (value.length == 42) {
      try {
        const _tokenDecimals = await disperse.getDecimals(provider, value)
        console.log(_tokenDecimals)
        setTokenDecimals(_tokenDecimals)
        setTokenContractAddress(value)
        setIsValidToken(true)
        setIsLoadingTokenInput(false)
        return
      } catch (error) {
        console.error(error)
      }
    }

    message.error(`Invalid token contract address: ${value}`)
    setIsValidToken(false)
    setIsLoadingTokenInput(false)
  }

  function handleDirectRecipientsInput(event) {
    let _isValidRecipients = true
    let _totalAmount = BigNumber.from('0')
    const _directRecipients = event.target.value.trim().split("\n").map(line => {
      const parsed = line.trim().replace(/(,|\s+|\t+)+/g, ' ').split(' ')

      const address = parsed[0]
      if (address.length != 42) {
        message.error(`Invalid address: ${address}`)
        _isValidRecipients = false
      }

      const amount = parsed[1]
      let amountAsBn = BigNumber.from('0')
      if (!amount || amount.includes('.')) {
        message.error(`Invalid integer: ${amount}`)
        _isValidRecipients = false
      } else {
        amountAsBn = BigNumber.from(amount)
        _totalAmount = _totalAmount.add(amountAsBn)
      }

      return {
        address,
        amount: amountAsBn,
        tokenId: -1
      }
    })
    setIsValidRecipients(_isValidRecipients)
    if (_isValidRecipients) {
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
      _isApproved = await disperse.checkApproved(
        provider,
        tokenContractAddress,
        totalAmount
      )
      if (_isApproved) {
        setIsAlreadyApproved(true)
        setIsApproved(true)
      } else {
        try {
          const txHash = await disperse.approveTransfer(provider, tokenContractAddress, totalAmount)
          setApprovedTxHash(txHash)
          setIsApproved(true)
        } catch (error) {
          console.error(error)
          message.error(`Failed to approve token transfer`)
        }
      }
    } catch (error) {
      console.error(error)
      message.error(`Failed to approve token transfer`)
    }

    setIsLoadingApprove(false)
  }

  async function handleSend() {
    setIsLoadingSend(true)

    try {
      const txHash = await disperse.disperseToken(provider, tokenContractAddress, {
        tokenContractAddress,
        direct: directRecipients,
        twitter: twitterRecipients
      })
      setSentTxHash(txHash)
      setIsSent(true)
    } catch (error) {
      console.error(error)
      message.error(`Failed to send`)
    }

    setIsLoadingSend(false)
  }

  return (
    <Container>
      <Erc20Page
        {...props}
        etherscanHost={etherscanHost}
        showApprovedButton={isValidToken && isValidRecipients}
        showSendButton={isValidToken && isValidRecipients}
        isLoadingTokenInput={isLoadingTokenInput}
        isLoadingApprove={isLoadingApprove}
        isLoadingSend={isLoadingSend}
        isApproved={isApproved}
        isAlreadyApproved={isAlreadyApproved}
        isSent={isSent}
        approvedTxHash={approvedTxHash}
        sentTxHash={sentTxHash}
        totalAmount={isValidToken && isValidRecipients && formatUnits(totalAmount, tokenDecimals)}
        handleTokenInput={handleTokenInput}
        handleDirectRecipientsInput={handleDirectRecipientsInput}
        handleApprove={handleApprove}
        handleSend={handleSend}
        inputRef={inputRef}
      />
    </Container>
  )
}
