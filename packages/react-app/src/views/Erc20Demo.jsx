import React from "react";
import { Link } from "react-router-dom";
//import 'antd/dist/antd.css'
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin, Card, Radio } from "antd";
import { Faucet, Balance } from "../components";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { TokenBalance } from "."
const { Text } = Typography;

function Erc20Demo({address, selectedProvider, localContracts, networks, network}) {
  console.log(localContracts)
  let options = localContracts?Object.keys(localContracts):[]
  console.log(options)
  return (
              <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                <Radio.Group
                    options={options}
                    optionType="button"
                  />
              </Card>
  );
}

export default Erc20Demo;
