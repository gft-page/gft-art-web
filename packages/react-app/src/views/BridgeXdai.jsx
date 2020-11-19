import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin, InputNumber } from "antd";
import { Faucet, Balance } from "../components";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { TokenBalance } from "."
import { Transactor } from "../helpers"
const { Text } = Typography;

function BridgeXdai({address, selectedProvider, network, networks, mainnetProvider, userProvider, mainnetUserProvider, gasPrice}) {

  const [bridgeValue, setBridgeValue] = useState()
  const [fromXdaiTx, setFromXdaiTx] = useState()
  const [fromXdaiMessageHash, setFromXdaiMessageHash] = useState()
  const [fromXdaiMessage, setFromXdaiMessage] = useState()
  const [fromXdaiSignatures, setFromXdaiSignatures] = useState()
  const [fromMainTx, setFromMainTx] = useState()
  const [sideToMain, setSideToMain] = useState(false)
  const [mainToSide, setMainToSide] = useState(false)

const tx = Transactor(userProvider, gasPrice)

  const abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (boolean)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  let mainnetUserSigner = userProvider.getSigner()

//"0x6B175474E89094C44Da98b954EedeAC495271d0F" <- dai contract
  let daiContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", abi, mainnetUserSigner);

  return (
              <Row align="middle" justify="center">
                <Col>
                  <Row align="middle" justify="center">
                  <span style={{fontSize:32}}>xDai</span><Balance address={address} provider={selectedProvider} size={32} />
                  </Row>

                  <Row justify="center" align="middle" style={{width:"100%"}}>
                  <TokenBalance
                    name={'dai'}
                    contract={daiContract}
                    address={address}
                    decimals={18} />
                  </Row>
                </Col>
              </Row>
  );
}

export default BridgeXdai;
