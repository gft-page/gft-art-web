import { ethers } from 'ethers'
import { getBurnersForTwitterUsernames } from './burners'

import { getNetwork, MAINNET, RINKEBY } from './network'

export const DISPERSE_CONTRACT_ADDRESS = {
  [MAINNET]: '0xd152f549545093347a162dce210e7293f1452150',
  [RINKEBY]: '0xD152f549545093347A162Dce210e7293f1452150'
}

export const ERC20_CONTRACT_ABI = [{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}]
export const DISPERSE_CONTRACT_ABI = [{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseTokenSimple","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"recipients","type":"address[]"},{"name":"values","type":"uint256[]"}],"name":"disperseEther","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]

export async function approveTransfer(tokenContractAddress, airdropAmount) {
  const network = await getNetwork(provider)
  const signer = await provider.getSigner()

  const disperseContractAddress = DISPERSE_CONTRACT_ADDRESS[network]

  const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_CONTRACT_ABI, signer)
  await tokenContract.approve(disperseContractAddress, airdropAmount)
}

export async function disperseToken(provider, tokenContractAddress, disperseRecipientData) {
  const network = await getNetwork(provider)
  const signer = await provider.getSigner()

  const contractAddress = DISPERSE_CONTRACT_ADDRESS[network]
  if (!contractAddress) throw new Error(`NET: No address for network ${network}`)
  const contract = new ethers.Contract(contractAddress, DISPERSE_CONTRACT_ABI, signer)

  const { recipientAddresses, recipientAmounts } = getRecipientParams(disperseRecipientData)

  await contract.disperseTokenSimple(tokenContractAddress, recipientAddresses, recipientAmounts)
}

function getRecipientParams(data) {
  let recipientAddresses = []
  let recipientAmounts = []

  if (data.direct) {
    recipientAddresses = recipientAddresses.concat(data.direct.map(recipient => recipient.address))
    recipientAmounts = recipientAmounts.concat(data.direct.map(recipient => recipient.amount))
  }

  if (data.twitter) {
    // TODO (#20): Order needs to match! Change this so we can guarantee the order is correct.
    const burners = getBurnersForTwitterUsernames(data.twitter, data.tokenContractAddress)
    recipientAddresses = recipientAddresses.concat(burners)
    recipientAmounts = recipientAmounts.concat(data.twitter.map(recipient => recipient.amount))
  }

  return { recipientAddresses, recipientAmounts }
}
