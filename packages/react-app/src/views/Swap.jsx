import React, { useState, useEffect } from "react";
import { Row, InputNumber, Input, Card, notification, Popover, Select, Descriptions, Typography, Button } from "antd";
import { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber } from "eth-hooks";
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

const { Option } = Select;

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
  const [balance, setBalance] = useState()
  const [slippageTolerance, setSlippageTolerance] = useState(new Percent(Math.round(defaultSlippage*100).toString(), "10000"))
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit)

  let blockNumber = useBlockNumber(selectedProvider, 3000)

  let signer = selectedProvider.getSigner()
  let routerContract = new ethers.Contract(ROUTER_ADDRESS, IUniswapV2Router02ABI, signer);

  useEffect(() => {
      console.log(tokens[tokenIn],tokens[tokenOut], amountIn, amountOut)
    if(tokenIn && tokenOut && (amountIn || amountOut)) {
      console.log('running')
      getTrades()
    }
  },[tokenIn, tokenOut, amountIn, amountOut, slippageTolerance, selectedProvider])

  const getTrades = async () => {

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

    let tempContract = new ethers.Contract(tokens[tokenIn].address, erc20Abi, selectedProvider);
    let accountList = await selectedProvider.listAccounts()
    console.log(accountList)
    let allowance
    let newBalance
    if(tokenIn == 'ETH') {
      newBalance = await selectedProvider.getBalance(accountList[0])
      setRouterAllowance()
    } else {
      allowance = await makeCall('allowance',tempContract,[accountList[0],ROUTER_ADDRESS])
      setRouterAllowance(allowance)
      newBalance = await makeCall('balanceOf',tempContract,[accountList[0]])
    }
    setBalance(newBalance)
  }

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
    makeCall(call, routerContract, args, metadata)
  }

  return (
    <Card>
    <div>Swap it up</div>
    <Row>
    <Select defaultValue={defaultToken} onChange={(value) => {
      console.log(value)
      setTokenIn(value)
    }}>
    {Object.keys(tokens).map(token => (
      <Option value={token}>{token}</Option>
    ))}
    </Select>
    <InputNumber min={0} value={amountIn} onChange={(e) => {
      setAmountOut()
      setAmountIn(e)
      setExact('in')
    }}/>
    </Row>
    <Row>
    <Select onChange={(value) => {
      console.log(value)
      setTokenOut(value)
    }}>
    {Object.keys(tokens).map(token => (
      <Option value={token}>{token}</Option>
    ))}
    </Select>
    <InputNumber min={0} value={amountOut} onChange={(e) => {
      setAmountOut(e)
      setAmountIn()
      setExact('out')
    }}/>
    </Row>
    <Row>
    <Typography>Slippage:</Typography>
    <InputNumber
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
    />
    </Row>
    <Row>
    <Typography>Time limit (seconds):</Typography>
    <InputNumber
      min={0}
      max={3600}
      defaultValue={defaultTimeLimit}
      onChange={(value) => {
      console.log(value)
      setTimeLimit(value)
     }}
    />
    </Row>
    <Row>
    <Button onClick={approveRouter}>Approve</Button>
    <Button onClick={removeRouterAllowance}>Remove Allowance</Button>
    <Button onClick={executeSwap}>Swap!</Button>
    </Row>
    <Descriptions title="Workings" column={1}>
      <Descriptions.Item label="exact">{exact}</Descriptions.Item>
      <Descriptions.Item label="balance">{balance?formatUnits(balance,tokens[tokenIn].decimals):null}</Descriptions.Item>
      <Descriptions.Item label="routerAllowance">{routerAllowance?formatUnits(routerAllowance,tokens[tokenIn].decimals):null}</Descriptions.Item>
      <Descriptions.Item label="bestPrice">{trades ? (trades.length > 0 ? trades[0].executionPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="nextMidPrice">{trades ? (trades.length > 0 ? trades[0].nextMidPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="route">{route.join("->")}</Descriptions.Item>
      <Descriptions.Item label="priceImpact">{trades ? (trades.length > 0 ? trades[0].priceImpact.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="blockNumber">{blockNumber}</Descriptions.Item>
      <Descriptions.Item label="slippageTolerance">{slippageTolerance?slippageTolerance.toSignificant(6):null}</Descriptions.Item>
      <Descriptions.Item label="amountInMax">{amountInMax?amountInMax.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="amountOutMin">{amountOutMin?amountOutMin.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="timeLimit">{timeLimit}</Descriptions.Item>
    </Descriptions>
    </Card>
  )

}

export default Swap;
