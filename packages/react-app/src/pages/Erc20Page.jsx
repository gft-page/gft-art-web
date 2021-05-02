import React from 'react'
import { Jumbotron } from 'react-bootstrap'
import { Tooltip, Form, Input, Select, InputNumber, Radio, Button, Checkbox, Divider, Card, message } from 'antd'

import * as colors from '../themes/dark'

export default function Erc20Page(props) {
  return (
    <div>
      <h1><small><strong>Airdrop ERC20 tokens with Disperse ✨</strong></small></h1>
      <Jumbotron>
        <Form
          name="marketplace"
        >
          <h5>
            <strong>Token address</strong>
          </h5>
          <Form.Item
            label=""
            name="customMarketplace"
          >
            <Input
              ref={props.inputRef}
              name="customMarketplace"
              placeholder="0x12345...."
              style={{ minWidth: "375px", maxWidth: "400px" }}
              onChange={props.handleTokenInput}
              onKeyPress={props.handleTokenInput}
              onClick={props.handleTokenInput}
              onBlur={props.handleTokenInput}
            />
          </Form.Item>
          <h5>
            <strong>Recipients and amounts</strong>
          </h5>
          <Form.Item name={['user', 'introduction']} label="">
            <Input.TextArea
              value={props.addressesTextarea}
              onChange={props.handleDirectRecipientsInput}
              placeholder={
                `0xb44f91949174fb47A7059A476A882447Fc6A08dD,1\n0xE2A5db9E741Cdf93e9C2eEA6e4247cA58Bf62024,1`
              }
            />
          </Form.Item>
          {!props.isApproved && !props.isAlreadyApproved && props.showApprovedButton ?
            <Button loading={props.isLoadingApprove} type="primary" onClick={props.handleApprove}>
              Approve Transfer
                </Button>
            : null}
          {props.isAlreadyApproved && <div>Already approved!</div>}
          {props.isApproved && props.showSendButton ?
            <Button type="primary" onClick={props.handleSend}>
              Send
                </Button>
            : null}
        </Form>
      </Jumbotron>
    </div>
  )
}