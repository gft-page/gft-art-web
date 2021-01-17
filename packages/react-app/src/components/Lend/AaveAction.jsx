import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, Card, notification, Checkbox, Select, Descriptions, List, Typography, Button, Divider, Tooltip, Drawer, Modal, Table } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

function AaveAction({ assetData, userAssetData, userAccountData, signer, lendingPoolContract, type, assetPrice  }) {

  const [modalVisible, setModalVisible] = useState(false)
  const [transacting, setTransacting] = useState(false)

  const [amount, setAmount] = useState(0)
  const [useMax, setUseMax] = useState(false)
  const [balance, setBalance] = useState()
  const [poolAllowance, setPoolAllowance] = useState()

  const [borrowType, setBorrowType] = useState("2")

  const getTokenBalance = async () => {
    let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
    let address = await signer.getAddress()
    let _balance = await tokenContract.balanceOf(address)
    setBalance(_balance)
    let _allowance = await tokenContract.allowance(address,lendingPoolContract.address)
    setPoolAllowance(_allowance)
  }

  useEffect(() => {
    if(modalVisible) {
    getTokenBalance()
  }
  },[amount, modalVisible])

  const approve = async (_amount) => {
    console.log("approving",_amount)
    let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
    let address = await signer.getAddress()
    let amountToApprove = _amount==="0"?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    let approval = await tokenContract.approve(lendingPoolContract.address, amountToApprove)
    console.log('approval', approval)
    getTokenBalance()
  }

  const deposit = async (_amount) => {
    console.log("depositing",_amount)
    let address = await signer.getAddress()
    let amountToDeposit = parseUnits(_amount,assetData.decimals)
    let deposit = await lendingPoolContract.deposit(assetData.tokenAddress, amountToDeposit, address, 0)
    console.log('deposit', deposit)
  }

  const withdraw = async (_amount) => {
    console.log("withdrawing")
    let address = await signer.getAddress()
    let amountToWithdraw = useMax?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    let withdraw = await lendingPoolContract.withdraw(assetData.tokenAddress, amountToWithdraw, address)
    console.log(withdraw)
  }

  const borrow = async (_amount) => {
    console.log("borrowing")
    let address = await signer.getAddress()
    let amountToBorrow = parseUnits(_amount,assetData.decimals)
    let borrow = await lendingPoolContract.borrow(assetData.tokenAddress, amountToBorrow, borrowType, 0, address)
    console.log('borrow', borrow)
  }

  const repay = async (_amount) => {
    console.log("repaying")
    let address = await signer.getAddress()
    let amountToRepay = useMax?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    console.log(useMax,ethers.constants.MaxUint256, amountToRepay)
    let repay = await lendingPoolContract.repay(assetData.tokenAddress, amountToRepay, borrowType, address)
    console.log('repay', repay)
  }

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
    setTransacting(true);
    let _amount = amount.toString()
    let _transaction
    if(type === "deposit") {
      _transaction = await deposit(_amount)
    } if(type==="withdraw") {
      _transaction = await withdraw(_amount)
    } if(type==="borrow") {
      _transaction = await borrow(_amount)
    } if(type==="repay") {
      _transaction = await repay(_amount)
    }
    setModalVisible(false);
    setTransacting(false)
  } catch(e) {
    console.log(e)
    setTransacting(false)
  }
  };

  const setMaxAmount = () => {
    if(useMax&&userAssetData&&type==="withdraw") {
      setAmount(parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)))
    } if(useMax&&userAssetData&&type==="repay") {
      let _repayAmount = borrowType=="2" ? userAssetData['currentVariableDebt'] : userAssetData['currentStableDebt']
      setAmount(parseFloat(formatUnits(_repayAmount, assetData.decimals)))
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  let poolNeedsAllowance = ['borrow','withdraw'].includes(type) ? false : (poolAllowance&&amount) ? parseFloat(formatUnits(poolAllowance, assetData.decimals)) < amount : true

  let maxBorrow = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.availableBorrowsETH)) / parseFloat(formatUnits(assetPrice)) : null
  let requiredCollateralETH = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.totalDebtETH)) / parseFloat(formatUnits(userAccountData.ltv, 4)) : 0.0
  let maxWithdrawETH = (userAccountData&&requiredCollateralETH) ? (parseFloat(formatUnits(userAccountData.totalCollateralETH)) - requiredCollateralETH) : 0.0
  let maxWithdraw = (assetPrice&&maxWithdrawETH) ? maxWithdrawETH / parseFloat(formatUnits(assetPrice)) : 0.0

  let maxValue = (type === 'borrow') ? maxBorrow : (type === 'withdraw') ? maxWithdraw : null

  let modal = (
    <Modal title={`${type.charAt(0).toUpperCase() + type.slice(1)} ${assetData&&assetData.symbol}`} visible={modalVisible} onOk={handleModalOk} onCancel={handleModalCancel} okButtonProps={{ disabled: poolNeedsAllowance, loading: transacting }}>
    <Space>
    <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amount} onChange={(e) => {
      setAmount(e)
      setUseMax(false)
    }} disabled={useMax}/>
    {['withdraw','repay'].includes(type)&&<Checkbox checked={useMax} onChange={()=>{
      setMaxAmount()
      setUseMax(!useMax)
    }}>Maximum</Checkbox>}
    {["borrow","repay"].includes(type)&&(
      <Select defaultValue="2" style={{ width: 120 }} onChange={(value) => {
        setBorrowType(value)
        setMaxAmount()
      }}>
        {(assetData&&assetData.stableBorrowRateEnabled)&&<Option value="1">Stable</Option>}
        <Option value="2">Variable</Option>
      </Select>
    )}
    </Space>
    <Divider/>
      {(balance&&assetData)&&<Row>{`Your wallet balance is ${balance&&formatUnits(balance, assetData.decimals)} ${assetData.symbol}`}</Row>}
      {(assetData&&userAssetData)&&<Row>{`Your deposit balance ${userAssetData['currentATokenBalance']&&formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)} ${assetData.symbol}`}</Row>}
      {(assetData&&userAssetData)&&<Row>{`Your variable debt is ${userAssetData['currentVariableDebt']&&formatUnits(userAssetData['currentVariableDebt'], assetData.decimals)} ${assetData.symbol}`}</Row>}
      {(assetData&&userAssetData)&&<Row>{`Your stable debt is ${userAssetData['currentStableDebt']&&formatUnits(userAssetData['currentStableDebt'], assetData.decimals)} ${assetData.symbol}`}</Row>}
      {(poolAllowance&&poolNeedsAllowance&&assetData)&&<Row>{`The pool's allowance is ${poolAllowance&&formatUnits(poolAllowance, assetData.decimals)} ${assetData.symbol}`}</Row>}
      {(assetPrice&&maxBorrow)&&<Row>{`Maximum borrow is ${maxBorrow} ${assetData.symbol}`}</Row>}
      {(assetPrice&&requiredCollateralETH)&&<Row>{`requiredCollateralETH is ${requiredCollateralETH}`}</Row>}
      {(assetPrice&&maxWithdrawETH)&&<Row>{`maxWithdrawETH is ${maxWithdrawETH}`}</Row>}
      {(assetPrice&&maxWithdraw)&&<Row>{`Maximum withdraw is ${maxWithdraw} ${assetData.symbol}`}</Row>}
      {(poolNeedsAllowance&&amount)?(
        <>
        <Button onClick={() => {approve(amount.toString())}}>Approve Amount</Button>
        <Button onClick={() => {approve("0")}}>Approve Max</Button>
        </>
      ):null}
    </Modal>
  )

  return (
    <>
    {modal}
    <Button loading={transacting} onClick={showModal}>{type}</Button>
    </>
  )

}

export default AaveAction;
