import { sendGFT } from "../backend/gft"

/*
disperseRecipientData = {
  tokenContractAddress,
  direct?: [{ address, amount, tokenId }],
  twitter?: [{ username, amount, tokenId }]
*/

/**
 *
 * @param {object} twitterRecipientData
 * @param {string} nftContractAddress
 * @returns Map of twitter usernames to burner addresses
 */
export function getBurnersForTwitterUsernames(twitterRecipientData, tokenContractAddress) {
  const twitterBurners = {}

  const twitterUsernames = twitterRecipientData.map(user => user.username)
  const tokenIds = twitterRecipientData.map(user => user.tokenId)

  const res = await sendGFT(tokenContractAddress, twitterUsernames, tokenIds)
  if (res.error) {
    throw new Error(`BUR: Failed to get burners. ${res.error}`)
  }
  res.data.addresses.forEach(address => {
    twitterBurners[address.username] = address.address
  })

  return twitterBurners
}
