import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Form, Tooltip, Select, InputNumber } from "antd";
import { parseUnits } from "@ethersproject/units";
import { ethers } from "ethers";

import { useResolveName, useDebounce } from "../hooks";

import { DAI_ADDRESS, DAI_ABI } from "../constants";

const { Option } = Select;

const SnatchToken = ({ mainnetProvider, localProvider, tx }) => {
  const [target, setTarget] = useState("ironsoul.eth");
  const [receiver, setReceiver] = useState("");
  const [token, setToken] = useState(DAI_ADDRESS)
  const [tokenList, setTokenList] = useState([])
  const [amount, setAmount] = useState()

  let tokenListUri = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

  useEffect(() => {
    const getTokenList = async () => {
      try {
      let tokenList = await fetch(tokenListUri)
      let tokenListJson = await tokenList.json()
      let filteredTokens = tokenListJson.tokens.filter(function (t) {
        return t.chainId === 1
      })
      setTokenList(filteredTokens)
      console.log(filteredTokens)
    } catch (e) {
      console.log(e)
    }
    }
    getTokenList()
  },[])

  const debouncedTarget = useDebounce(target, 500);

  const { addressFromENS, loading, error } = useResolveName(mainnetProvider, debouncedTarget);

  const impersonateSend = useCallback(async () => {
    const accountToImpersonate = addressFromENS;

    await localProvider.send("hardhat_impersonateAccount", [accountToImpersonate]);
    const signer = await localProvider.getSigner(accountToImpersonate);

    const myTokenContract = new ethers.Contract(token, DAI_ABI, signer);

    let _token = tokenList.filter(function (el) {
      return el.address === token})

    tx(myTokenContract.transfer(receiver, parseUnits(amount.toString(), _token[0].decimals)));
  }, [addressFromENS, receiver]);

  const getValidationProps = () => {
    if (loading) {
      return {
        validateStatus: "validating",
        help: "Resolving..",
      };
    } else if (error) {
      return {
        validateStatus: "error",
        help: error,
      };
    } else {
      return {
        validateStatus: "success",
      };
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "left",
        marginTop: "30px",
      }}
    >
      <Form.Item label="ENS name or address of your target:" hasFeedback {...getValidationProps()}>
        <Tooltip placement="bottom" title="Account must have non-zero ETH balance">
          <Input value={target} onChange={e => setTarget(e.target.value)} />
        </Tooltip>
      </Form.Item>
      <Form.Item label="Token">
        <Select showSearch onChange={(value) => setToken(value)}
        filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } optionFilterProp="children">
          {tokenList.map(token => (
            <Option key={token.address} value={token.address}>{token.symbol}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Amount">
        <InputNumber onChange={(value) => setAmount(value)} />
      </Form.Item>
      <Form style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Form.Item style={{ flexBasis: "75%" }}>
          <Input size="medium" onChange={e => setReceiver(e.target.value)} placeholder="Put receiver address" />
        </Form.Item>
        <Form.Item style={{ flexBasis: "20%" }}>
          <Button onClick={impersonateSend} disabled={error || loading || !receiver}>
            Snatch!
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SnatchToken;
