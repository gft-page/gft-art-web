import { BigNumber, ethers } from 'ethers'
import { getBurnersForTwitterUsernames } from './burners'
import { getNetwork, MAINNET, RINKEBY } from './network'

export const DISPERSE_CONTRACT_ADDRESS = {
  [MAINNET]: '0xd152f549545093347a162dce210e7293f1452150',
  [RINKEBY]: '0xD152f549545093347A162Dce210e7293f1452150'
}

export const ERC20_CONTRACT_ABI = [{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}]
export const DISPERSE_CONTRACT_ABI = [{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseTokenSimple","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseEther","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]

/**
 *
 * @param {object} provider
 * @param {string} tokenContractAddress
 * @param {string} amount Gets converted to BigNumber
 * @returns True if the Disperse contract is approved to send the amount of token on behalf of the provider signer
 */
export async function checkApproved(provider, tokenContractAddress, amount) {
  const network = await getNetwork(provider)
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()

  const disperseContract = buildDisperseContract(network, signer)
  const tokenContract = buildContract(tokenContractAddress, ERC20_CONTRACT_ABI, signer)

  const allowedAmount = await tokenContract.allowance(signerAddress, disperseContract.address)
  return BigNumber.from(amount).lte(BigNumber.from(allowedAmount))
}

/**
 * Approves Disperse contract to send amount of token on behalf of provider signer
 * @param {object} provider
 * @param {string} tokenContractAddress
 * @param {string} amount Total amount for the airdrop
 */
export async function approveTransfer(provider, tokenContractAddress, amount) {
  const network = await getNetwork(provider)
  const signer = await provider.getSigner()

  const disperseContractAddress = DISPERSE_CONTRACT_ADDRESS[network]

  const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_CONTRACT_ABI, signer)
  const tx = await tokenContract.approve(disperseContractAddress, amount)
  console.log(tx)
  await tx.wait()
}

/**
 * Sends tokens to recipients
 * @param {object} provider
 * @param {string} tokenContractAddress
 * @param {object} disperseRecipientData
 */
export async function disperseToken(provider, tokenContractAddress, disperseRecipientData) {
  const network = await getNetwork(provider)
  const signer = await provider.getSigner()
  const disperseContract = buildDisperseContract(network, signer)

  const { recipientAddresses, recipientAmounts } = await getRecipientParams(disperseRecipientData)

  await disperseContract.disperseTokenSimple(tokenContractAddress, recipientAddresses, recipientAmounts)
}

async function getRecipientParams(data) {
  let recipientAddresses = []
  let recipientAmounts = []

  if (data.direct) {
    recipientAddresses = recipientAddresses.concat(data.direct.map(recipient => recipient.address))
    recipientAmounts = recipientAmounts.concat(data.direct.map(recipient => recipient.amount))
  }

  if (data.twitter) {
    const burnerData = await getBurnersForTwitterUsernames(data.twitter, data.tokenContractAddress)
    /*

    twitter: [{
      username,
      amount,
      tokenId
    }]

    burnerMap: {
      username: address
    }

    */
    Object.keys(burnerData).forEach((username) => {
      const recipient = data.twitter.filter(recipient => recipient.username == username)
      const address = burnerData[username]
      const amount = recipient[0].amount
      recipientAddresses.push(address)
      recipientAmounts.push(amount)
    })
  }

  return { recipientAddresses, recipientAmounts }
}

/**
 * Returns Disperse ethers contract object
 * @param {string} network
 * @param {object} signer
 * @returns
 */
function buildDisperseContract(network, signer) {
  const contractAddress = DISPERSE_CONTRACT_ADDRESS[network]
  if (!contractAddress) throw new Error(`NET: No address for network ${network}`)
  return buildContract(contractAddress, DISPERSE_CONTRACT_ABI, signer)
}

/**
 * Returns ethers contract object
 * @param {string} address
 * @param {JSON} abi
 * @param {object} signer
 * @returns
 */
function buildContract(address, abi, signer) {
  const contract = new ethers.Contract(address, abi, signer)
  return contract
}
