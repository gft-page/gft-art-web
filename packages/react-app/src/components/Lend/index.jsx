import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, Card, notification, Select, Descriptions, Typography, Button, Divider, Tooltip, Drawer, Modal } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'

const { Option } = Select;
const { Text } = Typography;

export const POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'

const makeCall = async (callName, contract, args, metadata={}) => {
  if(contract[callName]) {
    let result
    if(args) {
      result = await contract[callName](...args, metadata)
    } else {
      result = await contract[callName]()
    }
    return result
  } else {
    console.log('no call of that name!')
  }
}

function Lend({ selectedProvider, tokenListURI }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  let signer = selectedProvider.getSigner()
  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);

  useEffect(() => {
    const getAaveInfo = async () => {
      let protocolDataAddress = await addressProviderContract.getAddress('0x1')//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(protocolDataAddress)
    }

    getAaveInfo()
  }, [])

  return (
    <Card title={`Hello friend do you want to lend?!`} extra={<Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>}>
    <Typography>Please stop</Typography>
    </Card>
  )

}

export default Lend;
