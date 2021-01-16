import React, { useState, useEffect } from "react";
import { Space, Row, Col, InputNumber, Card, notification, Select, Statistic, Descriptions, List, Typography, Button, Divider, Tooltip, Drawer, Modal, Table } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IErc20 } from './abis/erc20.json'
import { abi as IPriceOracle } from './abis/PriceOracle.json'
import AaveAction from "./AaveAction"

const { Option } = Select;
const { Text } = Typography;

export const POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
const PROTOCOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d'
const LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
const PRICE_ORACLE = '0xa50ba011c48153de246e5192c8f9258a2ba79ca9'

function Lend({ selectedProvider, tokenListURI }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  const [userConfiguration, setUserConfiguration] = useState()
  const [userActiveAssets, setUserActiveAssets] = useState()
  const [userAccountData, setUserAccountData] = useState()
  const [userAssetData, setUserAssetData] = useState({})
  const [userAssetList, setUserAssetList] = useState([])

  const [reserveTokens, setReserveTokens] = useState()
  const [assetData, setAssetData] = useState({})
  const [assetPrices, setAssetPrices] = useState({})

  let signer = selectedProvider.getSigner()
  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);
  let priceOracleContract = new ethers.Contract(PRICE_ORACLE, IPriceOracle, signer);

  const getReserveData = async () => {
    console.log('getting reserve data')
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
    getPriceData()
  }, [reserveTokens])


  const getPriceData = async () => {
    console.log('getting price data')
    if(reserveTokens) {
      let assetAddresses = reserveTokens.map(a => a.tokenAddress)
      console.log(assetAddresses)
      let prices = await priceOracleContract.getAssetsPrices(assetAddresses)
      console.log(prices)
      let _assetPrices = {}
      for (let i = 0; i < prices.length; i++) {
        let _symbol = reserveTokens[i]['symbol']
        _assetPrices[_symbol] = prices[i]
      }
      setAssetPrices(_assetPrices)
    }
  }

  const checkUserConfiguration = async (_configuration) => {
    if(_configuration && reserveTokens) {
      let _userActiveAssets = {}
      let configBits = parseInt(userConfiguration.toString(), 10).toString(2)
      let reversedBits = configBits.split("").reverse()
      let _userAssetList = {}
      for (let i = 0; i < reversedBits.length; i++) {
        let _assetIndex = Math.floor(i/2)
        if(reversedBits[i]==="1") {
          let _type = i%2===0?"debt":"collateral"
          let _symbol = reserveTokens[_assetIndex]['symbol']
          let _newAsset
          if(_userAssetList[_symbol]){
            _newAsset = [..._userAssetList[_symbol], _type]
          } else { _newAsset = [_type]}
          _userAssetList[_symbol] = _newAsset
        }
      }
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

  const getReserveTokens = async () => {
    if(!reserveTokens && dataProviderContract && selectedProvider) {
      console.log('getting Reserve Tokens')
      let _reserveTokens = await dataProviderContract.getAllReservesTokens()//.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(_reserveTokens)
      setReserveTokens(_reserveTokens)
    }
  }

  usePoller(getReserveTokens, 3000)
  usePoller(getReserveData, 15000)
  usePoller(getPriceData, 15000)
  usePoller(getUserInfo, 6000)

  const columns = [
  {
    title: 'Name',
    dataIndex: 'symbol',
    key: 'symbol',
    fixed: 'left',
  },
  {
    title: 'Liquidity',
    key: 'availableLiquidity',
    render: value => parseFloat(formatUnits(value.availableLiquidity, value.decimals)).toFixed(2),
  },
  {
    title: 'Deposit rate',
    key: 'depositRate',
    render: value => parseFloat(formatUnits(value.liquidityRate, 25)).toPrecision(4),
  },
  {
    title: 'Variable rate',
    key: 'variableRate',
    render: value => parseFloat(formatUnits(value.variableBorrowRate, 25)).toPrecision(4),
  },
  {
    title: 'Stable rate',
    key: 'stableRate',
    render: value => parseFloat(formatUnits(value.stableBorrowRate, 25)).toPrecision(4),
  },
  {
    title: 'Price (ETH)',
    key: 'price',
    render: value => assetPrices[value.symbol]&&formatEther(assetPrices[value.symbol]),
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
    title: 'Actions',
    key: 'actions',
    render: value => {
      return (<>
      <AaveAction type="deposit" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('collateral')).includes(value.symbol)&&(
        <AaveAction type="withdraw" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      {(userAccountData&&userAccountData.availableBorrowsETH>0)&&<AaveAction type="borrow" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>}
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('debt')).includes(value.symbol)&&(
        <AaveAction type="repay" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      </>)
    }
  },
];

  let userAccountDisplay
  if(userAccountData) {
    userAccountDisplay = (
      <>
      <Row gutter={16} justify="center" align="middle">
      <Col span={8}>
        <Statistic title={"collateral"} value={parseFloat(formatUnits(userAccountData.totalCollateralETH,18)).toFixed(3)}/>
      </Col>
      <Col span={8}>
        <Statistic title={"debt"} value={parseFloat(formatUnits(userAccountData.totalDebtETH,18)).toFixed(3)}/>
      </Col>
      <Col span={8}>
        <Statistic title={"allowance"} value={parseFloat(formatUnits(userAccountData.availableBorrowsETH,18)).toFixed(3)}/>
      </Col>
      </Row>
      <Drawer visible={settingsVisible} onClose={() => { setSettingsVisible(false) }} width={500}>
      <Descriptions title="Account Details" column={1} style={{textAlign: 'left'}}>
        <Descriptions.Item label={"currentLiquidationThreshold"}>{new Percent(userAccountData.currentLiquidationThreshold.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"ltv"}>{new Percent(userAccountData.ltv.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"healthFactor"}>{parseFloat(formatUnits(userAccountData.healthFactor,18)).toFixed(3)}</Descriptions.Item>
        {userConfiguration&&<Descriptions.Item label={`Account configuration`}>{parseInt(userConfiguration.toString(), 10).toString(2)}</Descriptions.Item>}
      </Descriptions>
      </Drawer>
      </>
  )
  }


  return (
    <Card title={<Space><img src="https://ipfs.io/ipfs/QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1" width='40' alt='aaveLogo'/><Typography>Aave Lender</Typography></Space>} extra={<Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>}>
    {userAccountDisplay}
    <Divider/>
    <Table dataSource={Object.values(assetData)} columns={columns} pagination={false} scroll={{ x: 1300 }}/>
    </Card>
  )

}

export default Lend;
