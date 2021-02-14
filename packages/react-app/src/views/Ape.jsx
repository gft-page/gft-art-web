import React, { useState, useEffect } from "react";
import { Card, Space, Row, Col, InputNumber, notification, Checkbox, Statistic, Select, Typography, Button, Divider, Modal, Steps, Skeleton } from "antd";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from '../components/Lend/abis/erc20.json'
import { abi as IStableDebtToken } from '../components/Lend/abis/StableDebtToken.json'
import { useContractLoader } from "../hooks";
import { usePoller } from "eth-hooks";
import { useAaveData } from "../components/Lend/AaveData"
import AccountSummary from "../components/Lend/AccountSummary"
import AccountSettings from "../components/Lend/AccountSettings"

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function Ape({ selectedProvider }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  const { reserveTokens, assetData, assetPrices, userAccountData, userConfiguration,  userAssetList, userAssetData, contracts } = useAaveData({ selectedProvider })
  const { addressProviderContract, dataProviderContract, lendingPoolContract, priceOracleContract } = contracts

  const [apeAsset, setApeAsset] = useState('WETH')
  const [borrowAsset, setBorrowAsset] = useState('DAI')
  const [debtType, setDebtType] = useState('v')

  let debtLookup = {
    's': "1",
    'v': "2"
  }

  const [creditDelegated, setCreditDelegated] = useState()
  const [aTokenAllowance, setATokenAllowance] = useState()

  const [delegating, setDelegating] = useState(false)
  const [allowing, setAllowing] = useState(false)
  const [aping, setAping] = useState(false)
  const [unwinding, setUnwinding] = useState(false)

  const writeContracts = useContractLoader(selectedProvider)

  let signer = selectedProvider.getSigner()

  let apeAssetData = assetData.find(obj => {
    return obj.symbol === apeAsset
  })

  let borrowAssetData = assetData.find(obj => {
    return obj.symbol === borrowAsset
  })

  const getCreditAllowance = async () => {
    if(reserveTokens&&borrowAssetData&&writeContracts&&writeContracts['AaveApe']) {

    //let borrowTokensAddresses = await dataProviderContract.getReserveTokensAddresses(borrowAssetData[`${debtType}Token`].id);
    let debtContract = new ethers.Contract(borrowAssetData[`${debtType}Token`].id, IStableDebtToken, signer);

    let address = await signer.getAddress()
    let aaveApeAddress = writeContracts['AaveApe'].address

    let _creditAllowance = await debtContract.borrowAllowance(address, aaveApeAddress)
    setCreditDelegated(_creditAllowance)
  }
  }

  usePoller(getCreditAllowance, 6000)

  const setFullCreditAllowance = async () => {
    if(reserveTokens&&assetData&&borrowAssetData&&writeContracts&&writeContracts['AaveApe']) {
    try {
      setDelegating(true)
      //let borrowTokensAddresses = await dataProviderContract.getReserveTokensAddresses(borrowAssetData.tokenAddress);
      let debtContract = new ethers.Contract(borrowAssetData[`${debtType}Token`].id, IStableDebtToken, signer);

      let address = await signer.getAddress()
      let aaveApeAddress = writeContracts['AaveApe'].address

      let _approveDelegation = await debtContract.approveDelegation(aaveApeAddress, ethers.constants.MaxUint256)
      console.log(_approveDelegation)
      setDelegating(false)
    }
    catch(e) {
      console.log(e)
      setDelegating(false)
    }
  }
  }


  const getATokenAllowance = async () => {
    if(reserveTokens&&assetData&&apeAssetData&&writeContracts&&writeContracts['AaveApe']) {

    //let apeTokensAddresses = await dataProviderContract.getReserveTokensAddresses(apeAssetData.tokenAddress);
    let aTokenContract = new ethers.Contract(apeAssetData.aToken.id, IErc20, signer);

    let address = await signer.getAddress()
    let aaveApeAddress = writeContracts['AaveApe'].address

    let _allowance = await aTokenContract.allowance(address, aaveApeAddress)
    setATokenAllowance(_allowance)
  }
  }

  usePoller(getATokenAllowance, 6000)

  const setFullATokenAllowance = async () => {
    if(reserveTokens&&assetData&&apeAssetData&&writeContracts&&writeContracts['AaveApe']) {
      try {
        setAllowing(true)
        //let apeTokensAddresses = await dataProviderContract.getReserveTokensAddresses(apeAssetData.tokenAddress);
        let aTokenContract = new ethers.Contract(apeAssetData.aToken.id, IErc20, signer);

        let address = await signer.getAddress()
        let aaveApeAddress = writeContracts['AaveApe'].address

        let _approve = await aTokenContract.approve(aaveApeAddress, ethers.constants.MaxUint256)
        console.log(_approve)
        setAllowing(false)
      }
      catch (e) {
        console.log(e)
        setAllowing(false)
      }
  }
  }

  let hasDelegatedCredit = creditDelegated&&creditDelegated.gt(ethers.constants.MaxUint256.div(ethers.BigNumber.from("10"))) ? true : false
  let hasATokenAllowance = aTokenAllowance&&aTokenAllowance.gt(ethers.constants.MaxUint256.div(ethers.BigNumber.from("10"))) ? true : false

  return (
    <Row justify="center" align="middle" gutter={16}>
    <Card title={`🦍 Aave Ape 🦍`} style={{ width: 600 }}
    extra={
      <AccountSettings userAccountData={userAccountData} userConfiguration={userConfiguration} userAssetList={userAssetList} />}
    >
    {userAccountData?<AccountSummary userAccountData={userAccountData}/>:<Skeleton active/>}
    <Divider/>
            <Title level={4}>Select your ape asset 🙈</Title>
            <Text>This is the asset you are going Long</Text>
          <Row justify="center" align="middle" gutter={16}>
            <Col>
              <Select showSearch value={apeAsset} style={{width: '120px'}} size={'large'} onChange={(value) => {
                console.log(value)
                setApeAsset(value)
              }} filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              } optionFilterProp="children">
              {reserveTokens&&reserveTokens.map(token => (
                <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
              ))}
              </Select>
            </Col>
            <Col>
              {userAssetData&&userAssetData[apeAsset]&&<Statistic title={"Deposited"} value={parseFloat(ethers.utils.formatUnits(userAssetData[apeAsset]['currentATokenBalance'], userAssetData[apeAsset].decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5})} suffix={apeAsset}/>}
            </Col>
          </Row>
      <Divider/>
        <Title level={4}>Select your borrow asset 📉</Title>
        <Text>This is the asset you are going Short</Text>
        <Row justify="center" align="middle" gutter={16}>
        <Col>
          <Select showSearch value={borrowAsset} style={{width: '120px'}} size={'large'} onChange={(value) => {
            console.log(value)
            setBorrowAsset(value)
          }} filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          } optionFilterProp="children">
          {reserveTokens&&reserveTokens.map(token => (
            <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
          ))}
          </Select>
        </Col>
        <Col>
        {(assetData&&userAssetData&&userAssetData[borrowAsset]&&borrowAssetData)&&<Statistic title={`Variable debt`} value={(userAssetData&&userAssetData[borrowAsset]['currentVariableDebt'])?parseFloat(formatUnits(userAssetData[borrowAsset]['currentVariableDebt'], borrowAssetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={borrowAssetData.symbol}/>}
        {(assetData&&userAssetData&&userAssetData[borrowAsset]&&borrowAssetData)&&<Statistic title={`Stable debt`} value={(userAssetData&&userAssetData[borrowAsset]['currentStableDebt'])?parseFloat(formatUnits(userAssetData[borrowAsset]['currentStableDebt'], borrowAssetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={borrowAssetData.symbol}/>}
        </Col>
        </Row>
        <Divider/>
        <Title level={4}>How to go ape 🦍</Title>
        <Steps>
          <Step status={hasDelegatedCredit?'finish':'wait'} title="Delegate credit" description={creditDelegated&&(hasDelegatedCredit?<p>You have delegated credit to the Aave Ape 🏦</p>:<Button loading={delegating} onClick={setFullCreditAllowance}>{"Delegate!"}</Button>)} />
          <Step status={hasDelegatedCredit?'finish':'wait'} title="Go ape!"
            description={creditDelegated&&(hasDelegatedCredit&&<>
              <Paragraph>{`Borrow the maximum, swap to ${apeAsset} and deposit to Aave`}</Paragraph>
              <Button loading={aping} type="primary" onClick={async () => {
              try {
              setAping(true)
              let _ape = await writeContracts.AaveApe['ape'](apeAssetData.underlyingAsset, borrowAssetData.underlyingAsset, debtLookup[debtType])
              console.log(_ape)
              notification.open({
                message: `You went ape! 🦍`,
                description:
                <><Text>{`Will you be king of the jungle?`}</Text></>,
              });
              setAping(false)
            } catch(e) {
              notification.open({
                message: `You didn't go ape :(`,
                description:
                <><Text>{`Some kind of monkey business: ${e.message}`}</Text></>,
              });
              console.log(e)
              setAping(false)
            }
          }}>{"Go Ape"}</Button></>)} />
        </Steps>
        <Divider/>
        <Title level={4}>Unwinding your ape 🍌</Title>
        <Steps>
          <Step status={hasATokenAllowance?'finish':'wait'} title={`Add a${apeAsset} allowance`} description={aTokenAllowance&&(hasATokenAllowance?<p>You have given an allowance to the Aave Ape 🏦</p>:<Button loading={allowing} onClick={setFullATokenAllowance}>{"Allow on the aToken!"}</Button>)} />
          <Step status={hasATokenAllowance?'finish':'wait'} title="Unwind your ape" description={aTokenAllowance&&(hasATokenAllowance&&<>
            <Paragraph>{`Flashloan the ${borrowAsset} you need to repay your debt, then withdraw some ${apeAsset} and swap it to settle up`}</Paragraph>
            <Button loading={unwinding} type="primary" onClick={async () => {
              try {
              setUnwinding(true)
              let _ape = await writeContracts.AaveApe['unwindApe'](apeAssetData.underlyingAsset, borrowAssetData.underlyingAsset, debtLookup[debtType])
              console.log(_ape)
              notification.open({
                message: `You unwound your ape 🦍`,
                description:
                <><Text>{`I hope you still have some bananas!`}</Text></>,
              });
              setUnwinding(false)
            } catch(e) {
              notification.open({
                message: `You didn't unwind your ape :(`,
                description:
                <><Text>{`Some kind of monkey business: ${e.message}`}</Text></>,
              });
              console.log(e)
              setUnwinding(false)
            }
          }}>{"Unwind Ape"}</Button>
            </>
          )} />
        </Steps>
    </Card>
    </Row>
  )

}

export default Ape;
