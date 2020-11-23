import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin, InputNumber, Card } from "antd";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { TokenBalance } from "."
import { useTokenBalance, useBalance } from "eth-hooks";
import { Transactor } from "../helpers"
import { JsonRpcProvider } from "@ethersproject/providers";
import { INFURA_ID } from "../constants";
const { Text } = Typography;

const mainnetProvider = new JsonRpcProvider(`https://kovan.infura.io/v3/${INFURA_ID}`)//`https://mainnet.infura.io/v3/${INFURA_ID}`)//getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });
const xDaiProvider = new JsonRpcProvider(`https://sokol.poa.network`)//`https://dai.poa.network`)

const daiTokenAddress = '0xff94183659f549D6273349696d73686Ee1d2AC83'//from Igor '0x40a81c34f36EbE2D98baC578d66d3EE952A48f24'//real '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const xDaiBridgeAddress = '0x867949C3F2f66D827Ed40847FaA7B3a369370e13'//from igor'0xed47976103eBcCF7685e8aF185deD9EcF57E146A'//real '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6'
const mainnetBridgeAddress = '0x99FB1a25caeB9c3a5Bf132686E2fe5e27BC0e2dd'//from igor'0xea7f8c8d2c55ee242f2f22c11f43421e459229b8'//real '0x4aa42145aa6ebf72e164c9bbc74fbd3788045016'

const decimals = 18

const xDaiChainId = 77 //100
const mainnetChainId = 42 //1

function BridgeXdai({address, selectedProvider, network, networks, userProvider, mainnetUserProvider, gasPrice}) {

  const [enteredAmount, setEnteredAmount] = useState('')
  const [fromXdaiTx, setFromXdaiTx] = useState("0x1225a647d379b4c6bbabf3c8a2d80c213751d6c0626ac7b10551431afe6810a2")
  const [fromXdaiAmount, setFromXdaiAmount] = useState("10000000000000000000")
  const [fromXdaiAddress, setFromXdaiAddress] = useState("0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc")
  const [fromXdaiMessageHash, setFromXdaiMessageHash] = useState()
  const [fromXdaiMessage, setFromXdaiMessage] = useState()
  const [fromXdaiSignatures, setFromXdaiSignatures] = useState()
  const [fromMainTx, setFromMainTx] = useState()
  const [selectedNetwork, setSelectedNetwork] = useState()

//  setFromXdaiTx("0x1225a647d379b4c6bbabf3c8a2d80c213751d6c0626ac7b10551431afe6810a2")
//  setFromXdaiAmount("10000000000000000000")
//  setFromXdaiAddress("0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc")

const tx = Transactor(userProvider, gasPrice)

  const erc20Abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (boolean)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  const mainnetBridgeAbi = [
    "function executeSignatures(bytes message, bytes signatures)"
  ]

  const xDaiHelperAbi = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_homeBridge","internalType":"address"},{"type":"address","name":"_foreignBridge","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IHomeErc20ToNativeBridge"}],"name":"bridge","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"clean","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes","name":"result","internalType":"bytes"}],"name":"getMessage","inputs":[{"type":"bytes32","name":"_msgHash","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes32","name":"","internalType":"bytes32"}],"name":"getMessageHash","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_value","internalType":"uint256"},{"type":"bytes32","name":"_origTxHash","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes","name":"","internalType":"bytes"}],"name":"getSignatures","inputs":[{"type":"bytes32","name":"_msgHash","internalType":"bytes32"}]}]

//"0x6B175474E89094C44Da98b954EedeAC495271d0F" <- dai contract
  let daiContract = new ethers.Contract(daiTokenAddress, erc20Abi, mainnetProvider);
  let xDaiHelperContract = new ethers.Contract("0x6A92e97A568f5F58590E8b1f56484e6268CdDC51", xDaiHelperAbi, xDaiProvider);
  let mainnetBridgeContract = new ethers.Contract(mainnetBridgeAddress, mainnetBridgeAbi, userProvider)

  let daiBalance = useTokenBalance(daiContract, address, 3000)
  let xDaiBalance = useBalance(xDaiProvider, address, 3000)

  const formatBalance = (balance, decimals, places) => {
    let formattedBalance = balance?formatUnits(balance, decimals):null
    return formattedBalance?Number.parseFloat(formattedBalance).toFixed(places?places:3):"loading..."
  }

  useEffect(() => {

  const updateNetwork = async () => {
    if(selectedProvider) {
    let newNetwork = await selectedProvider.getNetwork()
    setSelectedNetwork(newNetwork.chainId)
    }
  }

  updateNetwork()

  }, [selectedProvider])

  const checkForSignatures = async () => {
    if(fromXdaiTx && fromXdaiAmount && fromXdaiAddress) {
      let messageHash = await xDaiHelperContract.getMessageHash(fromXdaiAddress, fromXdaiAmount, fromXdaiTx)
      setFromXdaiMessageHash(messageHash)
      let message = await xDaiHelperContract.getMessage(messageHash)
      setFromXdaiMessage(message)
      let signatures = await xDaiHelperContract.getSignatures(messageHash)
      setFromXdaiSignatures(signatures)
    }
  }

  const getParsedValue = (v) => {
    let value;
    try {
      value = parseEther("" + v);
    } catch (e) {
      value = parseEther("" + parseFloat(v).toFixed(8));
    }
    return value
  }

  const sendXdaiToBridge = async () => {
    let parsedValue = getParsedValue(enteredAmount)
    let transaction = await tx({
      to: xDaiBridgeAddress,
      value: parsedValue,
    });
    console.log(transaction)
    setEnteredAmount('')
  }

  const sendDaiToBridge = async () => {
    let parsedValue = getParsedValue(enteredAmount)
    let valueString = parsedValue.toLocaleString('fullwide', {useGrouping:false})

    let userSigner = userProvider.getSigner()
    let daiSenderContract = new ethers.Contract(daiTokenAddress, erc20Abi, userSigner);
    try {
      let erc20tx = await daiSenderContract.transfer(
        mainnetBridgeAddress,
        valueString
      );
      console.log(erc20tx)
      setEnteredAmount('')
    } catch(e){
      console.log(e)
    }

  }

  let bridgeOption

  if(selectedNetwork == xDaiChainId || parseInt(selectedNetwork) == xDaiChainId) {
      bridgeOption = (
      <>
      <div class="nes-field">
        {xDaiBalance>0?<input type="number" id="xdai_to_dai" class="nes-input" placeholder="xdai to dai"
          onChange={async e => {
            let maxBalance = formatBalance(xDaiBalance, decimals)
            if(parseFloat(e.target.value) > parseFloat(maxBalance)) {
              setEnteredAmount(maxBalance)
            } else {
              setEnteredAmount(e.target.value)
            }
          }}
          value={enteredAmount}
        />:<input type="text" id="warning_field" class="nes-input" disabled placeholder="No dai to transfer"/>}
      </div>
      <button type="button" class={"nes-btn is-primary"} disabled={enteredAmount==""}
        onClick={sendXdaiToBridge}
      >↑</button>
      </>
    )
    } else if(selectedNetwork == mainnetChainId || parseInt(selectedNetwork) == mainnetChainId) {
      bridgeOption = (
      <>
      <div class="nes-field">
        {daiBalance>0?<input type="number" id="dai_to_xdai" class="nes-input" placeholder="dai to xdai"
        onChange={async e => {
          let maxBalance = formatBalance(daiBalance, decimals)
          if(parseFloat(e.target.value) > parseFloat(maxBalance)) {
            setEnteredAmount(maxBalance)
          } else {
            setEnteredAmount(e.target.value)
          }
        }}
        value={enteredAmount}
        />:<input type="text" id="warning_field" class="nes-input" disabled placeholder="No dai to transfer"/>}
      </div>
      <button type="button" class="nes-btn is-primary" disabled={enteredAmount==""}
      onClick={sendDaiToBridge}
      >↓</button>
      </>
      )
    } else {
      bridgeOption = <span>Select mainnet or xDai to use the bridge</span>
    }

  return (
    <>
              <Row align="middle" justify="center">
                <Col>
                <Row justify="center" align="middle" style={{width:"100%"}}>
                <Text style={{
                  verticalAlign: "middle",
                  fontSize: 32,
                  padding: 8,
                }}>
                  {'dai ' + formatBalance(daiBalance, decimals)}
                </Text>
                </Row>
                  <Row align="middle" justify="center">
                  {bridgeOption}
                  </Row>
                  <Row align="middle" justify="center">
                  <Text style={{
                    verticalAlign: "middle",
                    fontSize: 32,
                    padding: 8,
                  }}>
                    {'xDai ' + formatBalance(xDaiBalance, decimals)}
                  </Text>
                  </Row>
                </Col>
              </Row>
              <Row align="middle" justify="center">
              <Card>
                <p>1. Send xDai to the bridge <i class="nes-icon is-small star is-empty"></i><i class="nes-icon is-small star"></i></p>
                <p>2. Wait for the required signatures</p>
                {fromXdaiMessage?<p>{fromXdaiMessage}</p>:null}
                {fromXdaiSignatures?<p>{fromXdaiSignatures}</p>:null}
                <button type="button" class="nes-btn is-primary"
                onClick={checkForSignatures}
                >Check</button>
                <p>3. Execute the signatures on mainnet</p>
              </Card>
              </Row>
              </>

  );
}

export default BridgeXdai;
