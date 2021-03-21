import React from "react";
import NFT from './NFT';


export default function NFTList(props) {
  const nftList = props.list?.map((nft) => {
    return (
      <div key={nft.createdDate} style={{ marginBottom: 10 }}>
        <NFT address={nft.tokenAddress} id={nft.tokenId} network={props.network} />
        {
          props.burner
            ? <>
              <div>Burner address: {nft.burnerAddress}</div>
              <div>Burner private key: {nft.burnerKey}</div>
            </>
            : null
        }
      </div >
    );
  });
  return (
    <div>
      {nftList}
    </div>
  );
}
