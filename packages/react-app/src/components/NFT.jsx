import React, { useState } from "react";
import { Button, Input } from "antd";
import { WalletOutlined } from '@ant-design/icons';
import { transferNFT } from '../helpers'

export default function NFT(props) {

  const [toAddress, setToAddress] = useState("")


  async function transfer() {
    const res = await transferNFT(props.provider, props.address, props.id, toAddress)
  }

  function handleToAddress(event) {
    setToAddress(event.target.value)
  }

  return (
    <div >
      <div style={{ width: 600, marginLeft: 'auto', marginRight: 'auto' }}>
        <nft-card
          tokenAddress={props.address}
          tokenId={props.id}
          network={props.network}
          width="600px"
          height="600px"
        >
        </nft-card>
        {
          props.showTransfer ? <div style={{ textAlign: "center", marginTop: 10, }}>
            <Input.Search size="large" placeholder="Your permanent wallet address" prefix={<WalletOutlined />} onChange={handleToAddress}
              enterButton={
                <Button type="primary" disabled={toAddress.length < 42}>Transfer NFT</Button>
              }
              onSearch={transfer}
            />

          </div>
            : null
        }
      </div>
    </div >
  );
}
