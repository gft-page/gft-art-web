import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, Card, notification, Checkbox, Select, Descriptions, List, Typography, Button, Divider, Tooltip, Drawer, Modal, Table } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

function AaveAction({ symbol, assetAddress, decimals, signer, lendingPoolContract, type, stableRateEnabled, userAssetData }) {

  const [modalVisible, setModalVisible] = useState(false)
  const [depositing, setDepositing] = useState(false)

  const [amount, setAmount] = useState(0)
  const [useMax, setUseMax] = useState(false)
  const [balance, setBalance] = useState()
  const [poolAllowance, setPoolAllowance] = useState()

  const [borrowType, setBorrowType] = useState("2")

  let tokenContract = new ethers.Contract(assetAddress, IErc20, signer);

  const getTokenBalance = async () => {
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
    let address = await signer.getAddress()
    let amountToApprove = _amount==="0"?ethers.constants.MaxUint256:parseUnits(_amount,decimals)
    let approval = await tokenContract.approve(lendingPoolContract.address, amountToApprove)
    console.log('approval', approval)
    getTokenBalance()
  }

  const deposit = async (_amount) => {
    console.log("depositing",_amount)
    let address = await signer.getAddress()
    let amountToDeposit = parseUnits(_amount,decimals)
    let deposit = await lendingPoolContract.deposit(assetAddress, amountToDeposit, address, 0)
    console.log('deposit', deposit)
  }

  const withdraw = async (_amount) => {
    console.log("withdrawing")
    let address = await signer.getAddress()
    let amountToWithdraw = useMax?ethers.constants.MaxUint256:parseUnits(_amount,decimals)
    let withdraw = await lendingPoolContract.withdraw(assetAddress, amountToWithdraw, address)
    console.log(withdraw)
  }

  const borrow = async (_amount) => {
    console.log("borrowing")
    let address = await signer.getAddress()
    let amountToBorrow = parseUnits(_amount,decimals)
    let borrow = await lendingPoolContract.borrow(assetAddress, amountToBorrow, borrowType, 0, address)
    console.log('borrow', borrow)
  }

  const repay = async (_amount) => {
    console.log("repaying")
    let address = await signer.getAddress()
    let amountToRepay = useMax?ethers.constants.MaxUint256:parseUnits(_amount,decimals)
    let repay = await lendingPoolContract.repay(assetAddress, amountToRepay, borrowType, address)
    console.log('repay', repay)
  }

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    setModalVisible(false);
    let _amount = amount.toString()
    if(type === "deposit") {
      deposit(_amount)
    } if(type==="withdraw") {
      withdraw(_amount)
    } if(type==="borrow") {
      borrow(_amount)
    } if(type==="repay") {
      repay(_amount)
    }
  };

  const setMaxAmount = () => {
    if(useMax&&userAssetData&&type==="withdraw") {
      setAmount(parseFloat(formatUnits(userAssetData['currentATokenBalance'])))
    } if(useMax&&userAssetData&&type==="repay") {
      let _repayAmount = borrowType=="2" ? userAssetData['currentVariableDebt'] : userAssetData['currentStableDebt']
      setAmount(parseFloat(formatUnits(_repayAmount)))
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  let poolNeedsAllowance = ['borrow','withdraw'].includes(type) ? false : (poolAllowance&&amount) ? parseFloat(formatUnits(poolAllowance, decimals)) < amount : true

  let modal = (
    <Modal title={type} visible={modalVisible} onOk={handleModalOk} onCancel={handleModalCancel} okButtonProps={{ disabled: poolNeedsAllowance }}>
    <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amount} onChange={(e) => {
      setAmount(e)
    }} disabled={useMax}/>
    {['withdraw','repay'].includes(type)&&<Checkbox onChange={()=>{
      setMaxAmount()
      setUseMax(!useMax)
    }}>Checkbox</Checkbox>}
    {["borrow","repay"].includes(type)&&(
      <Select defaultValue="2" style={{ width: 120 }} onChange={(value) => {
        setBorrowType(value)
        setMaxAmount()
      }}>
        {stableRateEnabled&&<Option value="1">Stable</Option>}
        <Option value="2">Variable</Option>
      </Select>
    )}
      {balance&&<Row>{`Your wallet balance is ${balance&&formatUnits(balance, decimals)} ${symbol}`}</Row>}
      {userAssetData&&<Row>{`Your deposit balance ${userAssetData['currentATokenBalance']&&formatUnits(userAssetData['currentATokenBalance'], decimals)} ${symbol}`}</Row>}
      {userAssetData&&<Row>{`Your variable debt is ${userAssetData['currentVariableDebt']&&formatUnits(userAssetData['currentVariableDebt'], decimals)} ${symbol}`}</Row>}
      {userAssetData&&<Row>{`Your stable debt is ${userAssetData['currentStableDebt']&&formatUnits(userAssetData['currentStableDebt'], decimals)} ${symbol}`}</Row>}
      {(poolAllowance&&poolNeedsAllowance)&&<Row>{`The pool's allowance is ${poolAllowance&&formatUnits(poolAllowance, decimals)} ${symbol}`}</Row>}
      {(poolNeedsAllowance&&amount)&&(
        <>
        <Button onClick={() => {approve(amount.toString())}}>Approve Amount</Button>
        <Button onClick={() => {approve("0")}}>Approve Max</Button>
        </>
      )}
    </Modal>
  )

  return (
    <>
    {modal}
    <Button onClick={showModal}>{type}</Button>
    </>
  )

}

export default AaveAction;
