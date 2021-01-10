import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, Card, notification, Select, Descriptions, List, Typography, Button, Divider, Tooltip, Drawer, Modal, Table } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IErc20 } from './abis/erc20.json'
import AaveAction from "./AaveAction"

const { Option } = Select;
const { Text } = Typography;

export const POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
const PROTOCOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d'
const LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'

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

  const [userConfiguration, setUserConfiguration] = useState()
  const [userActiveAssets, setUserActiveAssets] = useState()
  const [userAccountData, setUserAccountData] = useState()
  const [userAssetData, setUserAssetData] = useState({})
  const [userAssetList, setUserAssetList] = useState([])

  const [reserveTokens, setReserveTokens] = useState()
  const [assetData, setAssetData] = useState({})

  let signer = selectedProvider.getSigner()
  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);

  const getReserveData = async () => {
    if(reserveTokens) {
      reserveTokens.forEach(async (asset) => {
        let _reserveData = await dataProviderContract.getReserveData(asset.tokenAddress)
        let _reserveConfigurationData = await dataProviderContract.getReserveConfigurationData(asset.tokenAddress)
        let _newAssetData = {}
        _newAssetData[asset.symbol] = {...asset, ..._reserveData, ..._reserveConfigurationData}
        setAssetData(assetData => {
          return {...assetData, ..._newAssetData}})
      })
    }
  }

  useEffect(() => {
    getReserveData()
  }, [reserveTokens])

  const checkUserConfiguration = async (_configuration) => {
    if(_configuration && reserveTokens) {
      let _userActiveAssets = {}
      let configBits = parseInt(userConfiguration.toString(), 10).toString(2)
      let reversedBits = configBits.split("").reverse()
      let _userAssetList = {}
      for (let i = 0; i < reversedBits.length; i++) {
        let _assetIndex = Math.floor(i/2)
        if(reversedBits[i]==="1") {
          console.log(i, _assetIndex, reserveTokens[_assetIndex], i % 2, reversedBits[i]);
          let _type = i%2===0?"debt":"collateral"
          let _symbol = reserveTokens[_assetIndex]['symbol']
          let _newAsset
          if(_userAssetList[_symbol]){
            _newAsset = [..._userAssetList[_symbol], _type]
          } else { _newAsset = [_type]}
          _userAssetList[_symbol] = _newAsset
        }
      }
      console.log(_userAssetList)
      setUserAssetList(_userAssetList)
    }
  }

  useEffect(() => {
    checkUserConfiguration(userConfiguration)
  }, [userConfiguration])

  const getUserAssetData = async () => {
    if(userAssetList && reserveTokens) {
      let address = await signer.getAddress()

      reserveTokens.forEach(async (asset) => {
        let _asset = {}
        let _data
        if(Object.keys(userAssetList).includes(asset.symbol)) {
          console.log('getting data!', asset)
          _data = await dataProviderContract.getUserReserveData(asset.tokenAddress,address)
          console.log(_data)
        }
        _asset[asset.symbol] = _data
        console.log(_asset)
        setUserAssetData(userAssetData => {
          return {...userAssetData, ..._asset}})
      })
      }
    }

  useEffect(() => {
    getUserAssetData()
  },[userAssetList])

  const getLendingPoolContract = async () => {
    let lendingPoolAddress = await addressProviderContract.getLendingPool()//makeCall('getAddress', addressProviderContract, ["0x1"])
    console.log(lendingPoolAddress)
    return new ethers.Contract(lendingPoolAddress, ILendingPool, signer);
  }

  const getUserInfo = async () => {
    console.log('asset_data',assetData)
    console.log('getting user info')
    let address = await signer.getAddress()
    let _accountData = await lendingPoolContract.getUserAccountData(address)
    setUserAccountData(_accountData)
    let _userConfiguration = await lendingPoolContract.getUserConfiguration(address)
    setUserConfiguration(_userConfiguration)
  }

  const withdraw = async (_assetAddress, _signer) => {
    console.log("withdrawing")
    let address = await _signer.getAddress()
    let withdraw = await lendingPoolContract.functions.withdraw(_assetAddress, ethers.constants.MaxUint256, address)
    console.log(withdraw)
  }

    const getAaveInfo = async () => {
      console.log('getting Aave Info')
      let address = await signer.getAddress()
      let _reserveTokens = await dataProviderContract.getAllReservesTokens()//.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(_reserveTokens)
      setReserveTokens(_reserveTokens)
    }


  const columns = [
  {
    title: 'Name',
    dataIndex: 'symbol',
    key: 'symbol',
  },
  {
    title: 'Liquidity',
    key: 'availableLiquidity',
    render: value => formatUnits(value.availableLiquidity, value.decimals),
  },
  {
    title: 'Deposited',
    key: 'deposited',
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentATokenBalance'])&&formatUnits(userAssetData[value.symbol]['currentATokenBalance'], value.decimals),
  },
  {
    title: 'Stable Debt',
    key: 'stableDebt',
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentStableDebt'])&&formatUnits(userAssetData[value.symbol]['currentStableDebt'], value.decimals),
  },
  {
    title: 'Variable Debt',
    key: 'variableDebt',
    render: value => (userAssetData[value.symbol])&&formatUnits(userAssetData[value.symbol]['currentVariableDebt'], value.decimals),
  },
  {
    title: 'Deposit',
    key: 'deposit',
    render: value => <AaveAction type="deposit" symbol={value.symbol} assetAddress={value.tokenAddress} decimals={value.decimals} signer={signer} lendingPoolContract={lendingPoolContract} userAssetData={userAssetData[value.symbol]}/>
  },
  {
    title: 'Withdraw',
    key: 'withdraw',
    render: value => {
      return (Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('collateral')).includes(value.symbol)&&(
        <AaveAction type="withdraw" symbol={value.symbol} assetAddress={value.tokenAddress} decimals={value.decimals} signer={signer} lendingPoolContract={lendingPoolContract} userAssetData={userAssetData[value.symbol]}/>
      ))
      }
  },
  {
    title: 'Borrow',
    key: 'borrow',
    render: value => <AaveAction type="borrow" symbol={value.symbol} assetAddress={value.tokenAddress} decimals={value.decimals} signer={signer} lendingPoolContract={lendingPoolContract} stableRateEnabled={value.stableBorrowRateEnabled} userAssetData={userAssetData[value.symbol]}/>
  },
  {
    title: 'Repay',
    key: 'repay',
    render: value => {
      return (Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('debt')).includes(value.symbol)&&(
        <AaveAction type="repay" symbol={value.symbol} assetAddress={value.tokenAddress} decimals={value.decimals} signer={signer} lendingPoolContract={lendingPoolContract} stableRateEnabled={value.stableBorrowRateEnabled} userAssetData={userAssetData[value.symbol]}/>
      ))
      }
  },
];

  let userAccountDisplay
  if(userAccountData) {
    userAccountDisplay = (
      <Descriptions title="User Info">
        <Descriptions.Item label={"availableBorrowsETH"}>{formatUnits(userAccountData.availableBorrowsETH,18)}</Descriptions.Item>
        <Descriptions.Item label={"totalCollateralETH"}>{formatUnits(userAccountData.totalCollateralETH,18)}</Descriptions.Item>
        <Descriptions.Item label={"totalDebtETH"}>{formatUnits(userAccountData.totalDebtETH,18)}</Descriptions.Item>
        <Descriptions.Item label={"currentLiquidationThreshold"}>{userAccountData.currentLiquidationThreshold.toString()}</Descriptions.Item>
        <Descriptions.Item label={"ltv"}>{userAccountData.ltv.toString()}</Descriptions.Item>
        <Descriptions.Item label={"healthFactor"}>{userAccountData.healthFactor.toString()}</Descriptions.Item>
      </Descriptions>
  )
  }


  return (
    <Card title={`Hello friend do you want to lend?!`} extra={<Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>}>
    <Button onClick={getAaveInfo}>Get Aave info</Button>
    <Button onClick={getUserInfo}>Get User info</Button>
    {userConfiguration&&<Typography>{`Account configuration: ${parseInt(userConfiguration.toString(), 10).toString(2)}`}</Typography>}
    {userAccountDisplay}
    <Table dataSource={Object.values(assetData)} columns={columns} pagination={false}/>
    </Card>
  )

}

export default Lend;
