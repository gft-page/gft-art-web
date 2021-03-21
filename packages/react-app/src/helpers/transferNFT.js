import { ethers } from "ethers";
import { default as Transactor } from './Transactor'

const ERRC1155_ABI = `[{"inputs": [{"internalType": "address","name": "_owner","type": "address"},{"internalType": "uint256","name": "_id","type": "uint256"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "_from","type": "address"},{"internalType": "address","name": "_to","type": "address"},{"internalType": "uint256","name": "_id","type": "uint256"},{"internalType": "uint256","name": "_value","type": "uint256"},{"internalType": "bytes","name": "_data","type": "bytes"}],"name": "safeTransferFrom","outputs": [],"stateMutability": "nonpayable","type": "function"}]`
// function safeTransferFrom(address _from,address _to,uint256 _id,uint256 _value,bytes calldata _data) external;
// 
const ERRC721_ABI = `[{"inputs": [{"internalType": "address","name": "_from","type": "address"},{"internalType": "address","name": "_to","type": "address"},{"internalType": "uint256","name": "_tokenId","type": "uint256"}],"name": "safeTransferFrom","outputs": [],"stateMutability": "payable","type": "function"}]`
// function safeTransferFrom(address _from,address _to,uint256 _tokenId) external payable;

export default async function transferNFT(provider, nftContractAddress, nftTokenId, toAddress) {
    const nftContract1155 = new ethers.Contract(nftContractAddress, ERRC1155_ABI, provider.getSigner());
    const nftContract721 = new ethers.Contract(nftContractAddress, ERRC721_ABI, provider.getSigner());

    const owner = (await provider.listAccounts())[0]

    console.log("#######", nftContractAddress, owner, toAddress, nftTokenId)

    let tx
    try {
        const balance = await nftContract1155.balanceOf(owner, nftTokenId)
        console.log("#######", balance.toNumber())
        tx = await nftContract1155.populateTransaction.safeTransferFrom(owner, toAddress, nftTokenId, balance.toHexString(), [])
    } catch (err) {
        tx = await nftContract721.populateTransaction.safeTransferFrom(owner, toAddress, nftTokenId)
    }

    await Transactor(provider)(tx)
}