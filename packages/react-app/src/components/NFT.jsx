import React from "react";


export default function NFT(props) {
  return (
    <div>
      <nft-card
        tokenAddress={props.address}
        tokenId={props.id}
        network={props.network}
        orientationMode="auto"
        width="200"
      >
      </nft-card>
    </div>
  );
}
