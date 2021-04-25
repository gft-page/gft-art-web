import React, { useState } from 'react'
import { Jumbotron } from 'react-bootstrap'
import {  Tooltip, Form, Input, Select, InputNumber, Radio, Button, Checkbox, Row, Col, Divider, Card, message } from 'antd'

export default function MintPage() {

  const [loading, setLoading] = useState(false)

  function handleSelectClick() {

  }

  function handleSelectChange() {

  }

  return (
    <div>
      <h1><small><strong>Mint your NFTs ✨</strong></small></h1>
      <Jumbotron>
        <h5>
          <strong>Select an NFT contract to mint with</strong>
        </h5>
        <Form
          name="mintForm"
          layout="inline"
        >
          <Form.Item
            name="select"
            label=""
          >
            <Select
              value={''}
              onClick={handleSelectClick}
              onChange={handleSelectChange}
              placeholder="Select an NFT contract"
              loading={loading}
              style={{ width: "200px" }}
            >
              <option value="GENERIC_721">Generic 721 Address</option>
              <option value="GENERIC_1155">Generic 1155 Address</option>
              <option value="RARIBLE_721">Rarible 721</option>
              <option value="RARIBLE_1155">Rarible 1155</option>
              <option value="ZORA">Zora</option>
            </Select>
          </Form.Item>
        </Form>
        <br />
        <br />
        <Row gutter={16}></Row>
      </Jumbotron>
    </div>

  )
}
