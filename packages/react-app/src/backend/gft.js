
import { get, post } from './api'

async function receiveGFT(username, oauthToken, oauthSecret) {
    return await get(`gft/twitter/recipients/${username}?oauth_token=${oauthToken}&oauth_token_secret=${oauthSecret}`)
}

/**
 * Makes a gft in the db and generates burner wallets for twitter users
 * @param {string} contractAddress
 * @param {Array<string>} usernames
 * @param {Array<string>} tokenIds
 * @returns
 */
async function sendGFT(contractAddress, usernames, tokenIds) {
    return await post('gft/twitter/', {
        contractAddress,
        usernames,
        tokenIds
    })
}


export { receiveGFT, sendGFT }