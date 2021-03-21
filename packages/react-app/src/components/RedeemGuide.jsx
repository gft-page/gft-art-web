import React, { useState } from 'react';
import { Steps, Input, Select, InputNumber, Radio, Button, Checkbox, Row, Col, Divider, Card } from "antd";

const { Step } = Steps;
const { Meta } = Card;

export default function RedeemGuide() {
  const [current, setCurrent] = useState(0);
  function onChange(data) {
    console.log(data)
    setCurrent(data)
  }
  return (
    <div>
      <h5 className="header"><strong>How to redeem your NFTs</strong></h5>
      <i>"Not your keys, not your crypto!"</i>
      <br></br>
        We've generated custodial wallets for your NFTs called "burners". Burner wallets
        are used for temporary storage but are not safe to keep your valuable assets in
        for a long time.
      <br></br>
      <br></br>
      {/* <h6><strong>Send 1 or more NFTs to people</strong></h6> */}
      <Row gutter={16} justify="space-between">
        <Steps current={current} onChange={onChange}>
          <Step title="Set up your own wallet" description={
            <Card style={{ width: 300, background: "transparent", borderColor: "transparent" }}>
              <p>Set up your own permanent crypto wallet to store your NFTs in.</p>
              <Meta description={
                <Button href="https://metamask.io/" target="_blank">Learn how</Button>
              } />
            </Card>
          } />
          <Step title="Get some ETH" description={
            <Card style={{ width: 300, background: "transparent", borderColor: "transparent" }}>
              <p>Fund your wallet to pay the "gas" fees to transfer assets like NFTs.</p>
              <Meta description={
                <Button href="https://support.mycrypto.com/general-knowledge/ethereum-blockchain/what-is-gas" target="_blank">Learn how</Button>
              } />
            </Card>
          } />
          <Step title="Secure your NFTs" description={
            <Card style={{ width: 300, background: "transparent", borderColor: "transparent" }}>
              <p>
                Transfer your NFT gifts to your own wallet to keep them safe.
              </p>
              <Meta description={
                <Button href="https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account" target="_blank">Learn how</Button>
              } />
            </Card>
          } />
        </Steps>
      </Row>
    </div>
  )
}
