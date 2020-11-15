import React from "react";
import { Link } from "react-router-dom";
import { SendOutlined } from "@ant-design/icons";
import { Row, Typography, Spin } from "antd";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { useTokenBalance } from "eth-hooks";
const { Text } = Typography;

function TokenBalance({name, contract, address, decimals}) {
  let balance = useTokenBalance(contract, address)
  let formattedBalance = balance?formatUnits(balance, decimals):"loading..."
  let sendButton = (balance>0)?<Link to={"/send-token?token="+name}><SendOutlined style={{fontSize: 32, padding: 8, verticalAlign: "middle"}}/></Link>:null

  return (
    <>
    <Text
      strong={true}
      style={{
        verticalAlign: "middle",
        fontSize: 32,
        padding: 8,
      }}
    >
      {name}
    </Text>
    <Text style={{
      verticalAlign: "middle",
      fontSize: 32,
      padding: 8,
    }}>
      {formattedBalance}
    </Text>
    {sendButton}
    </>
  )
}

export default TokenBalance;
