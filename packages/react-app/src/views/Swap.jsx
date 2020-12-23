import React, { useState, useEffect } from "react";
import { Space, Row, Col, InputNumber, Input, Card, notification, Popover, Select, Descriptions, Typography, Button, Divider, Tooltip, Drawer } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

const { Option } = Select;
const { Text, Link } = Typography;

const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
const LINK = new Token(ChainId.MAINNET, '0x514910771AF9Ca656af840dff83E8264EcF986CA', 18, 'LINK', 'ChainLink Token')
const UNI = new Token(ChainId.MAINNET, '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 18, 'UNI', 'Uniswap')

export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)"
];

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

let tokens = {'ETH': WETH[DAI.chainId], DAI, USDC, USDT, COMP, MKR, LINK, UNI}

let defaultToken = 'ETH'
let defaultSlippage = '0.5'
let defaultTimeLimit = 60 * 10

function Swap({ selectedProvider }) {

  const [tokenIn, setTokenIn] = useState(defaultToken)
  const [tokenOut, setTokenOut] = useState()
  const [exact, setExact] = useState()
  const [amountIn, setAmountIn] = useState()
  const [amountInMax, setAmountInMax] = useState()
  const [amountOut, setAmountOut] = useState()
  const [amountOutMin, setAmountOutMin] = useState()
  const [trades, setTrades] = useState()
  const [routerAllowance, setRouterAllowance] = useState()
  const [fromContract, setFromContract] = useState()
  const [balanceIn, setBalanceIn] = useState()
  const [balanceOut, setBalanceOut] = useState()
  const [slippageTolerance, setSlippageTolerance] = useState(new Percent(Math.round(defaultSlippage*100).toString(), "10000"))
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit)
  const [swapping, setSwapping] = useState(false)
  const [approving, setApproving] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)

  const [tokenList, setTokenList] = useState()

  const [invertPrice, setInvertPrice] = useState(false)

  let blockNumber = useBlockNumber(selectedProvider, 3000)

  let signer = selectedProvider.getSigner()
  let routerContract = new ethers.Contract(ROUTER_ADDRESS, IUniswapV2Router02ABI, signer);

  useEffect(() => {
    const getTokenList = async () => {
      let tokenList = await fetch('https://gateway.ipfs.io/ipns/tokens.uniswap.org')
      let tokenListJson = await tokenList.json()
      console.log(tokenListJson)
      setTokenList(tokenListJson.tokens)
    }
    getTokenList()
  },[])

  useEffect(() => {
      getTrades()
  },[tokenIn, tokenOut, amountIn, amountOut, slippageTolerance, selectedProvider])

  const getBalance = async (_token, _account, _contract) => {

    console.log(_token, [_account], _contract)

    let newBalance
    if(_token == 'ETH') {
      newBalance = await selectedProvider.getBalance(_account)
    } else {
      newBalance = await makeCall('balanceOf', _contract, [_account])
    }
    return newBalance
  }

  const getTrades = async () => {
    if(tokenIn && tokenOut && (amountIn || amountOut)) {

    let pairs = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v,w]) ).flat();

    let baseTokens = [DAI, USDC, USDT, COMP, WETH[DAI.chainId], MKR, LINK, UNI]

    let listOfPairwiseTokens = pairs(baseTokens)

    const getPairs = async (list) => {
      console.log(selectedProvider)
      let listOfPromises = list.map(item => Fetcher.fetchPairData(item[0], item[1], selectedProvider))
      return Promise.all(listOfPromises.map(p => p.catch(() => undefined)));
    }

    let listOfPairs = await getPairs(listOfPairwiseTokens)

    console.log(listOfPairs)

    let bestTrade

    if(exact == 'in') {
      setAmountInMax()
      bestTrade = Trade.bestTradeExactIn(
      listOfPairs.filter(item => item),
      new TokenAmount(tokens[tokenIn], parseUnits(amountIn.toString(), tokens[tokenIn].decimals)),
      tokens[tokenOut])
      if(bestTrade[0]) {
        setAmountOut(bestTrade[0].outputAmount.toSignificant(6))
        setAmountOutMin(bestTrade[0].minimumAmountOut(slippageTolerance))
      } else { setAmountOut() }
    } else if (exact == 'out') {
      setAmountOutMin()
      bestTrade = Trade.bestTradeExactOut(
      listOfPairs.filter(item => item),
      tokens[tokenIn],
      new TokenAmount(tokens[tokenOut], parseUnits(amountOut.toString(), tokens[tokenOut].decimals)))
      if(bestTrade[0]) {
        setAmountIn(bestTrade[0].inputAmount.toSignificant(6))
        setAmountInMax(bestTrade[0].maximumAmountIn(slippageTolerance))
      } else { setAmountIn() }
    }

    setTrades(bestTrade)

    console.log(bestTrade, bestTrade[0]? bestTrade[0].inputAmount.toSignificant(6) : null)

    let tempContractIn = new ethers.Contract(tokens[tokenIn].address, erc20Abi, selectedProvider);
    let tempContractOut = new ethers.Contract(tokens[tokenOut].address, erc20Abi, selectedProvider);
    let accountList = await selectedProvider.listAccounts()
    console.log(accountList)
    let allowance
    let newBalanceIn = await getBalance(tokenIn, accountList[0], tempContractIn)
    let newBalanceOut = await getBalance(tokenOut, accountList[0], tempContractOut)

    if(tokenIn == 'ETH') {
      setRouterAllowance()
    } else {
      allowance = await makeCall('allowance',tempContractIn,[accountList[0],ROUTER_ADDRESS])
      setRouterAllowance(allowance)
    }

    setBalanceIn(newBalanceIn)
    setBalanceOut(newBalanceOut)

  }
  }

  usePoller(getTrades, 9000)

  let route = trades ? (trades.length > 0 ? trades[0].route.path.map(function(item) {
  return item['symbol'];
}) : []) : []

  const updateRouterAllowance = async (newAllowance) => {
    let signer = selectedProvider.getSigner()
    let tempContract = new ethers.Contract(tokens[tokenIn].address, erc20Abi, signer);
    let result = await makeCall('approve', tempContract, [ROUTER_ADDRESS, newAllowance])
    console.log(result)
  }

  const approveRouter = async () => {
    let approvalAmount = exact == 'in' ? ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals)) : amountInMax.raw.toString()
    console.log(approvalAmount)
    updateRouterAllowance(approvalAmount)
  }

  const removeRouterAllowance = async () => {
    let approvalAmount = ethers.utils.hexlify(0)
    console.log(approvalAmount)
    updateRouterAllowance(approvalAmount)
  }

  const executeSwap = async () => {
    setSwapping(true)
    try {
      let args
      let metadata = {}

      let call
      let deadline = Math.floor(Date.now() / 1000) + timeLimit
      let path = trades[0].route.path.map(function(item) {
        return item['address'];
      })
      console.log(path)
      let accountList = await selectedProvider.listAccounts()
      let address = accountList[0]

      if (exact == 'in') {
        let _amountIn = ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals))
        let _amountOutMin = ethers.utils.hexlify(ethers.BigNumber.from(amountOutMin.raw.toString()))
        if (tokenIn == 'ETH') {
          call = 'swapExactETHForTokens'
          args = [_amountOutMin, path, address, deadline]
          metadata['value'] = _amountIn
        } else {
          call = tokenOut == 'ETH' ? 'swapExactTokensForETH' : 'swapExactTokensForTokens'
          args = [_amountIn, _amountOutMin, path, address, deadline]
        }
      } else if (exact == 'out') {
        let _amountOut = ethers.utils.hexlify(parseUnits(amountOut.toString(), tokens[tokenOut].decimals))
        let _amountInMax = ethers.utils.hexlify(ethers.BigNumber.from(amountInMax.raw.toString()))
        if (tokenIn == 'ETH') {
          call = 'swapETHForExactTokens'
          args = [_amountOut, path, address, deadline]
          metadata['value'] = _amountInMax
        } else {
          call = tokenOut == 'ETH' ? 'swapTokensForExactETH' : 'swapTokensForExactTokens'
          args = [_amountOut, _amountInMax, path, address, deadline]
        }
      }
      console.log(call, args, metadata)
      let result = await makeCall(call, routerContract, args, metadata)
      console.log(result)
      notification.open({
        message: 'Swap complete 🦄',
        description:
        `Swapped ${tokenIn} for ${tokenOut}, transaction: ${result.hash}`,
      });
      setSwapping(false)
  } catch (e) {
    console.log(e)
    setSwapping(false)
    notification.open({
      message: 'Swap unsuccessful',
      description:
      `Error: ${e.message}`,
    });
  }
  }

  let insufficientBalance = balanceIn ? parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)) < amountIn : null
  let inputIsToken = tokenIn != 'ETH'
  let insufficientAllowance = !inputIsToken ? false : routerAllowance ? parseFloat(formatUnits(routerAllowance,tokens[tokenIn].decimals)) < amountIn : null
  let formattedBalanceIn = balanceIn?parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)).toPrecision(6):null
  let formattedBalanceOut = balanceOut?parseFloat(formatUnits(balanceOut,tokens[tokenOut].decimals)).toPrecision(6):null

  let metaIn = tokenList && tokenIn ? tokenList.filter(function (t) {
  return t.address == tokens[tokenIn].address && t.chainId == ChainId.MAINNET
})[0] : null
  let metaOut = tokenList && tokenOut ? tokenList.filter(function (t) {
  return t.address == tokens[tokenOut].address && t.chainId == ChainId.MAINNET
  })[0] : null

  const cleanIpfsURI = (uri) => {
    return (uri).replace('ipfs://','https://ipfs.io/ipfs/')
  }

  let logoIn = metaIn?cleanIpfsURI(metaIn.logoURI):null
  let logoOut = metaOut?cleanIpfsURI(metaOut.logoURI):null

  let price = trades&&trades[0]?parseFloat(trades[0].executionPrice.toSignificant(6)):null
  let priceDescription = price ? (invertPrice ? `${(1/price).toPrecision(6)} ${tokenIn} per ${tokenOut}` : `${price} ${tokenOut} per ${tokenIn}`) : null
  console.log(priceDescription)

  console.log(insufficientBalance, inputIsToken, insufficientAllowance)

  return (
    <Card title={<Space><img src="https://ipfs.io/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg" width='40'/><Typography>Uniswapper</Typography></Space>} extra={<a onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></a>}>
    <Space direction="vertical">
    <Row justify="center" align="middle">
    <Card size="small" type="inner" title={`From${exact=='out' && tokenIn && tokenOut?' (estimate)':''}`} extra={<Space><img src={logoIn} width='30'/><span>{formattedBalanceIn}</span></Space>} style={{ width: 400, textAlign: 'left' }}>
      <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amountIn} onChange={(e) => {
        setAmountOut()
        setAmountIn(e)
        setExact('in')
      }}/>
      <Select style={{width: '120px'}} size={'large'} bordered={false} defaultValue={defaultToken} onChange={(value) => {
        console.log(value)
        setTokenIn(value)
      }}>
      {Object.keys(tokens).map(token => (
        <Option value={token}>{token}</Option>
      ))}
      </Select>
    </Card>
    </Row>
    <Row justify="center" align="middle">
      <Tooltip title={route.join("->")}><span>↓</span></Tooltip>
    </Row>
    <Row justify="center" align="middle">
    <Card size="small" type="inner" title={`To${exact=='in' && tokenIn && tokenOut?' (estimate)':''}`} extra={<Space><img src={logoOut} width='30'/><span>{formattedBalanceOut}</span></Space>} style={{ width: 400, textAlign: 'left' }}>
      <InputNumber style={{width: '160px'}} size={'large'} min={0} value={amountOut} onChange={(e) => {
        setAmountOut(e)
        setAmountIn()
        setExact('out')
      }}/>
      <Select style={{width: '120px'}} size={'large'} bordered={false} onChange={(value) => {
        console.log(value)
        setTokenOut(value)
      }}>
      {Object.keys(tokens).map(token => (
        <Option value={token}>{token}</Option>
      ))}
      </Select>
    </Card>
    </Row>
    <Row justify="center" align="middle">
      {priceDescription?<Space><Text type="secondary">{priceDescription}</Text><a onClick={() => {setInvertPrice(!invertPrice)}}><RetweetOutlined /></a></Space>:null}
    </Row>
    <Row justify="center" align="middle">
    <Space>
      {inputIsToken?<Button size="large" disabled={!insufficientAllowance} onClick={approveRouter}>{(!insufficientAllowance&&amountIn&&amountOut)?'Approved':'Approve'}</Button>:null}
      <Button size="large" loading={swapping} disabled={insufficientAllowance || insufficientBalance || !amountIn || !amountOut} onClick={executeSwap}>{insufficientBalance?'Insufficient balance':'Swap!'}</Button>
    </Space>
    </Row>
    </Space>
    <Drawer visible={settingsVisible} onClose={() => { setSettingsVisible(false) }} width={300}>
    <Descriptions title="Details" column={1} style={{textAlign: 'left'}}>
      <Descriptions.Item label="blockNumber">{blockNumber}</Descriptions.Item>
      <Descriptions.Item label="routerAllowance"><Space>{routerAllowance?formatUnits(routerAllowance,tokens[tokenIn].decimals):null}{routerAllowance>0?<Button onClick={removeRouterAllowance}>Remove Allowance</Button>:'n/a'}</Space></Descriptions.Item>
      <Descriptions.Item label="route">{route.join("->")}</Descriptions.Item>
      <Descriptions.Item label="exact">{exact}</Descriptions.Item>
      <Descriptions.Item label="bestPrice">{trades ? (trades.length > 0 ? trades[0].executionPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="nextMidPrice">{trades ? (trades.length > 0 ? trades[0].nextMidPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="priceImpact">{trades ? (trades.length > 0 ? trades[0].priceImpact.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="slippageTolerance">{<InputNumber
        defaultValue={defaultSlippage}
        min={0}
        max={100}
        precision={2}
        formatter={value => `${value}%`}
        parser={value => value.replace('%', '')}
        onChange={(value) => {
          console.log(value)

         let slippagePercent = new Percent(Math.round(value*100).toString(), "10000")
         setSlippageTolerance(slippagePercent)
       }}
      />}</Descriptions.Item>
      <Descriptions.Item label="amountInMax">{amountInMax?amountInMax.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="amountOutMin">{amountOutMin?amountOutMin.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="timeLimitInSeconds">{<InputNumber
              min={0}
              max={3600}
              defaultValue={defaultTimeLimit}
              onChange={(value) => {
              console.log(value)
              setTimeLimit(value)
             }}
            />}</Descriptions.Item>
    </Descriptions>
    </Drawer>
    </Card>
  )

}

export default Swap;
