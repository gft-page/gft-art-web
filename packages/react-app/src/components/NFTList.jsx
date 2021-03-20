import React from "react";
import NFT from './NFT';


export default function NFTList(props) {
  const nftList = props.list?.map((nft) => {
    return (
      <div key={nft.createdDate}>
        <NFT address={nft.tokenAddress} id={nft.tokenId} network={props.network} />
        <div>Burner address: {nft.burnerAddress}</div>
        <div>Burner private key: {nft.burnerKey}</div>
      </div>
    );
  });
  return (
    <div>
      {nftList}
    </div>
  );
}
