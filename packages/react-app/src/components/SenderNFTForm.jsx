import React from "react";
import {  Tooltip, Form, Input, Select, InputNumber, Radio, Button, Checkbox, Row, Col, Divider, Card, message } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function SenderNFTForm(props) {
  return(
    <Form
      onSubmit={event => props.handleGiftSubmit(event)}
      name="gift"
    >
      {!props.using721() ? "Enter NFT token ID" : null}
      {!props.using721() ?
        <Form.Item
          onChange={props.handleChange}
          value={props.tokenID}
          label=""
          name="tokenID"
        >
          <Input
            name="tokenID"
            placeholder="For ex. 123456"
            style={{ width: '50%' }}
          />
        </Form.Item>
        : null
      }
      {!props.using721() ?
        <>
          Enter default # of tokens to send
          <Form.Item
            onChange={props.handleChange} value={props.numTokens}
            label=""
            name="numTokens"
          >
            <Input name="numTokens" placeholder="1" style={{ width: '50%' }} />
          </Form.Item>
        </>
        : null
      }
      <strong>Send to recipients</strong>
      {!props.using721() ?
        <p>On each line, enter: <tt>address, # of tokens to send</tt></p>
        : <p>On each line, enter: <tt>address, token ID</tt></p>
      }
      <Form.Item name={['user', 'introduction']} label="">
        <Input.TextArea
          value={props.addressesTextarea}
          onChange={props.handleAddressesChange}
          placeholder={`0xb44f91949174fb47A7059A476A882447Fc6A08dD, 1
          0xE2A5db9E741Cdf93e9C2eEA6e4247cA58Bf62024, 1`}
        />
      </Form.Item>
      {props.twitterMap && Object.keys(props.twitterMap).length ?
        <>
          {
            !props.using721() ?
            <p>For each twitter user, enter # of tokens to send</p>
            : <p>For each twitter user, enter ID of token</p>
          }
          {
            Object.keys(props.twitterMap).map((username) => {
              const val = props.twitterMap[username.toLowerCase()]
              console.log(val)
              return (
                <Row>
                  <Col>
                    <Form.Item
                      onChange={props.handleTwitterUsersValueChange}
                      label=""
                      key={username}
                      name={username}
                      value={val == "DEFAULT" ? "" : val}
                      style={{marginBottom: 2}}
                    >
                      <Input placeholder="1" style={{ width: '75%' }} />
                    </Form.Item>
                  </Col>
                  <Col>@{username}</Col>
                </Row>
              );
            })
          }
        </>
        : null
      }
      <br />
      <Form.Item
        onChange={props.handleValueChange}
        label={
          <>
            Send ETH to subsidize gas &nbsp;
            <Tooltip title="Transferring an NFT costs some gas. You can enter an amount of ETH to be split up equally between your recipients to subsidize their gas costs.">
              <QuestionCircleOutlined />
            </Tooltip>
          </>
        }
        value={props.value}
        style={{marginBottom: 2}}
      >
        <Input placeholder="0 ETH" style={{ width: '100px' }} />
      </Form.Item>
      <Button type="primary" onClick={event => props.handleGiftSubmit(event)}>Send NFTs</Button>
    </Form>
  );
}
