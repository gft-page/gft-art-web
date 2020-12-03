import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
//import 'antd/dist/antd.css'
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin, Card, Radio, Form, Button, Input, InputNumber, notification } from "antd";
import { Faucet, Balance, Blockie, AddressInput } from "../components";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
import { TokenBalance } from "."
import { Transactor } from "../helpers";
const { Text } = Typography;

function Erc20Demo({address, selectedProvider, localContracts, networks, network, mainnetProvider}) {

  const [addressInfoForm] = Form.useForm();

  const [selectedContract, setSelectedContract] = useState()
  const [totalSupply, setTotalSupply] = useState()
  const [myBalance, setMyBalance] = useState()
  const [decimals, setDecimals] = useState()

  const [addressBalance, setAddressBalance] = useState()
  const [addressAllowance, setAddressAllowance] = useState()

  let contractOptions = localContracts?Object.keys(localContracts):[]

  const makeCall = async (callName, contract, args) => {
    if(contract[callName]) {
      let result
      if(args) {
        result = await contract[callName](...args)
      } else {
        result = await contract[callName]()
      }
      return result
    }
  }

  const getErc20Info = async () => {
    if(selectedContract) {
      let _totalSupply = await makeCall('totalSupply', localContracts[selectedContract])
      let _decimals = await makeCall('decimals', localContracts[selectedContract])
      let _balanceOf = await makeCall('balanceOf', localContracts[selectedContract], [address])

      setTotalSupply(formatUnits(_totalSupply, _decimals))
      setMyBalance(formatUnits(_balanceOf, _decimals))
      setDecimals(_decimals)
    }
  }

  usePoller(getErc20Info, 3000)

  let contractTitle

  if(selectedContract) {
    contractTitle = (
      <Row justify="center" align="middle" style={{padding: "8px"}}>
        <Typography>{selectedContract}</Typography>
        <Blockie address={localContracts[selectedContract]["address"]}/>
      </Row>
    )
  }

  const getAddressInfo = async values => {
    console.log(values)
    if(selectedContract) {
      let _balanceOf = await makeCall('balanceOf', localContracts[selectedContract], [values.address])
      let _allowanceOf = await makeCall('allowance', localContracts[selectedContract], [address, values.address])

      setAddressAllowance(formatUnits(_allowanceOf, decimals))
      setAddressBalance(formatUnits(_balanceOf, decimals))
    }
  }

  return (
              <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                <Radio.Group
                    options={contractOptions}
                    optionType="button"
                    onChange={(e) => { setSelectedContract(e.target.value) }}
                    value={selectedContract}
                  />
                {contractTitle}
                <p>{"TotalSupply: "+totalSupply}</p>
                <p>{"Balance: "+myBalance}</p>
                <Button onClick={() => {makeCall('mintTokens', localContracts[selectedContract])}}>Mint</Button>
                <Button onClick={async () => {
                  let result = await makeCall('outstandingTokens', localContracts[selectedContract])
                  let formattedResult = formatUnits(result, decimals)
                  notification.open({
                    message: 'Tokens outstanding',
                    description:
                    `👀 There are ${formattedResult} tokens available to claim`,
                  });
                }}>GetOutstanding</Button>
                <Button onClick={() => {makeCall('mintOutstandingTokens', localContracts[selectedContract])}}>MintOutstanding</Button>
                <div style={{margin:8}}>
                <Form
                  form={addressInfoForm}
                  layout="horizontal"
                  onFinish={getAddressInfo}
                  onFinishFailed={errorInfo => {
                    console.log('Failed:', errorInfo);
                    }}
                >
                  <Form.Item name="address">
                    <AddressInput placeholder="address"
                    autoFocus
                    ensProvider={mainnetProvider}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                  </Form.Item>
                </Form>
                <p>{"Address Balance: "+addressBalance}</p>
                <p>{"Address Allowance: "+addressAllowance}</p>
                </div>
              </Card>
  );
}

export default Erc20Demo;
