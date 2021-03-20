import React from "react";
import NFT from './NFT';


export default function NFTList(props) {
  const nftList = props.list.map((nft) => {
    return (
      <NFT address={nft.tokenAddress} id={nft.tokenId} network={props.network} />
    );
  });
  return (
    <div>
      {nftList}
    </div>
  );
}
