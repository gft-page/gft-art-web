import { ethers } from "ethers"
import { get } from "../backend/api"
import { default as Transactor } from './Transactor'

import { sendGFT } from '../backend/gft'

const CONTRACT_ABI = [{ "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "distribute1155s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenIDs", "type": "uint256[]" }], "name": "distribute721s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nft", "type": "address" }, { "internalType": "uint256", "name": "tokenID", "type": "uint256" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "distributeSame1155s", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }]

const CONTRACT_ADDRESS = {
    "MAINNET": "0xeb014c4066374f616cc56aa9e43ed2205dbeb33e",
    "RINKEBY": "0x5164072f5eb25305961184e7b50FE9F9eB7Ed018" //"0xfd7bdd0ba917a32565de6da1b2c918a8a8feadb8"
}

const isPreset = (address) => ["ZORA", "RARIBLE_1155", "RARIBLE_721"].indexOf(address) !== -1

const CONTRACT_PRESETS = {
    "MAINNET": {
        "ZORA": "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
        "RARIBLE_1155": "0xd07dc4262BCDbf85190C01c996b4C06a461d2430",
        "RARIBLE_721": "0x60F80121C31A0d46B5279700f9DF786054aa5eE5",
    },
    "RINKEBY": {
        "ZORA": "0x7C2668BD0D3c050703CEcC956C11Bd520c26f7d4",
        "RARIBLE_1155": "0x2eBecaBBbe8a8C629b99aB23ed154d74CD5d4342",
        "RARIBLE_721": "0x509FD4cdAa29Be7B1fAD251d8Ea0fCA2Ca91eb60",
    }
}

async function getNetwork(provider) {
    const chainId = (await provider.getNetwork()).chainId
    return chainId === 1 ? "MAINNET" :
        (chainId === 4 ? "RINKEBY" : new Error("unsupported network"))
}


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
export async function gft1155NFTs(provider, nftContract, data, eth) {
    const network = await getNetwork(provider)
    if (isPreset(nftContract)) nftContract = CONTRACT_PRESETS[network][nftContract]
    const gftContract = CONTRACT_ADDRESS[network]

    const isSame = data.length === 1

    const usernames = []
    const tokenIds = []
    data.forEach(d => {
        if (d.twitter)
            d.twitter.forEach(e => {
                tokenIds.push(d.tokenId)
                usernames.push(e.recipient)
            })
    })

    const twitterToBurner = {}
    if (usernames.length > 0) {
        const res = await sendGFT(nftContract, usernames, tokenIds)
        if (res.error) return { error: res.error }
        res.data.addresses.forEach(a => twitterToBurner[a.username] = a.address)
    }

    const callTokenIds = []
    const callRecipients = []
    const callAmts = []

    data.forEach(d => {
        if (d.eth)
            d.eth.forEach(e => {
                callTokenIds.push(d.tokenId)
                callRecipients.push(e.recipient)
                callAmts.push(e.amount)
            })

        if (d.twitter)
            d.twitter.forEach(e => {
                callTokenIds.push(d.tokenId)
                callRecipients.push(twitterToBurner[e.recipient])
                callAmts.push(e.amount)
            })
    })


    const contract = new ethers.Contract(gftContract, CONTRACT_ABI, provider.getSigner());

    const tx = isSame ?
        await contract.populateTransaction.distributeSame1155s(nftContract, callTokenIds[0], callRecipients, callAmts)
        :
        await contract.populateTransaction.distribute1155s(nftContract, callRecipients, callTokenIds, callAmts)

    if (eth) tx.value = ethers.utils.parseEther(`${eth}`)

    await Transactor(provider)(tx)
}

// if 721:
/*
data: {
        eth: [
             {recipient: "0x...", tokenId: 1 },
            ...
        ],
        twitter: [
             {recipient: "@...", tokenId: 1 },
            ...
        ]
    }
*/
export async function gft721NFTs(provider, nftContract, data, eth) {
    const network = await getNetwork(provider)
    if (isPreset(nftContract)) nftContract = CONTRACT_PRESETS[network][nftContract]
    const gftContract = CONTRACT_ADDRESS[network]

    const twitterToBurner = {}
    if (data.twitter) {
        const tokenIds = data.twitter.map(t => t.tokenId)
        const usernames = data.twitter.map(t => t.recipient)


        const res = await sendGFT(nftContract, usernames, tokenIds)
        console.log(res)

        if (res.error) return { error: res.error }
        res.data.addresses.forEach(a => twitterToBurner[a.username] = a.address)
    }


    console.log(twitterToBurner)


    const callTokenIds = []
    const callRecipients = []

    if (data.eth)
        data.eth.forEach(e => {
            callTokenIds.push(e.tokenId)
            callRecipients.push(e.recipient)
        })

    if (data.twitter)
        data.twitter.forEach(e => {
            callTokenIds.push(e.tokenId)
            callRecipients.push(twitterToBurner[e.recipient])
        })


    const contract = new ethers.Contract(gftContract, CONTRACT_ABI, provider.getSigner());
    console.log("============== 3", gftContract, nftContract, callRecipients, callTokenIds)
    const tx = await contract.populateTransaction.distribute721s(nftContract, callRecipients, callTokenIds)

    if (eth) tx.value = ethers.utils.parseEther(`${eth}`)

    await Transactor(provider)(tx)
}





const APPROVAL_ABI = [
    { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }
]





export async function checkApproved(provider, nftContract) {
    const network = await getNetwork(provider)
    if (isPreset(nftContract)) nftContract = CONTRACT_PRESETS[network][nftContract]
    const gftContract = CONTRACT_ADDRESS[network]


    if (!nftContract || !nftContract || String(nftContract).slice(0, 2) != '0x' || nftContract.length != 42) {
        return { error: "invalid contract address", approved: false }
    }

    const nft = new ethers.Contract(nftContract, APPROVAL_ABI, provider.getSigner());
    const account = (await provider.listAccounts())[0]

    let approved = false

    try {
        approved = await nft.isApprovedForAll(account, gftContract)
    } catch (error) {
        return { error, approved: false }
    }

    return { approved }
}


// Call this when the secondary button is clicked
export async function approve(provider, nftContract) {
    const network = await getNetwork(provider)
    if (isPreset(nftContract)) nftContract = CONTRACT_PRESETS[network][nftContract]
    const gftContract = CONTRACT_ADDRESS[network]


    if (!nftContract || !nftContract || String(nftContract).slice(0, 2) != '0x' || nftContract.length != 42) {
        return { error: "invalid contract address" }
    }

    const nft = new ethers.Contract(nftContract, APPROVAL_ABI, provider.getSigner());

    try {
        const tx = await nft.populateTransaction.setApprovalForAll(gftContract, true)
        await Transactor(provider)(tx)
        return {}
    } catch (err) {
        return { error: err }
    }
}

