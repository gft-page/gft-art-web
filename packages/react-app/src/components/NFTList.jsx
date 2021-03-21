import React from "react";
import NFT from './NFT';


export default function NFTList(props) {
  const nftList = props.list?.map((nft, i) => {
    return (
      <div key={nft.createdDate} style={{ marginBottom: 20 }}>
        <NFT address={nft.tokenAddress} id={nft.tokenId} network={props.network} key={i} showTransfer={props.showTransfer} provider={props.provider} />
        {
          props.burner
            ? <div >
              <table>
                <tr>
                  <td>Burner address</td>
                  <td>{nft.burnerAddress}</td>
                </tr>

                <tr>
                  <td>Burner private key</td>
                  <td>{nft.burnerKey}</td>
                </tr>
              </table>
            </div>
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
