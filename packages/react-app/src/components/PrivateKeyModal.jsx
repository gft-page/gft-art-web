import React, { useState } from "react";
import { WalletOutlined, QrcodeOutlined, SendOutlined, KeyOutlined } from "@ant-design/icons";
import { Tooltip, Spin, Modal, Button, Typography } from "antd";
import QR from "qrcode.react";
import { parseEther } from "@ethersproject/units";
import { useUserAddress } from "eth-hooks";
import { Transactor } from "../helpers";
import Address from "./Address";
import Balance from "./Balance";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import { ethers } from "ethers";
const { Text, Paragraph } = Typography;

/*

  Wallet UI for sending, receiving, and extracting the burner wallet

  <Wallet
    address={address}
    provider={userProvider}
    ensProvider={mainnetProvider}
    price={price}
  />

*/

export default function Wallet(props) {
  const signerAddress = useUserAddress(props.provider);
  const selectedAddress = props.address || signerAddress;

  const [open, setOpen] = useState();
  const [qr, setQr] = useState();
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();
  const [pk, setPK] = useState(selectedAddress)

  let display;

  const showButton = (
      <WalletOutlined
        onClick={() => {
          setOpen(!open);
        }}
        rotate={-90}
        style={{
          padding: 7,
          color: props.color ? props.color : "#1890ff",
          cursor: "pointer",
          fontSize: 28,
          verticalAlign: "middle",
        }}
      />
  )

  if(pk){

   let pk = localStorage.getItem("metaPrivateKey")
   let wallet = new ethers.Wallet(pk)

   if(wallet.address!=selectedAddress){
     display = (
       <div>
         <b>*injected account*, private key unknown</b>
       </div>
     )
   }else{
     display = (
       <div>
         <b>Private Key:</b>

         <div>
          <Text copyable>{pk}</Text>
          </div>

          <hr/>

         <i>Point your camera phone at qr code to open in <a target="_blank" href={"https://xdai.io/"+pk}>burner wallet</a>:</i>
         <QR value={"https://xdai.io/"+pk} size={"450"} level={"H"} includeMargin={true} renderAs={"svg"} imageSettings={{excavate:false}}/>

         <Paragraph style={{fontSize:"16"}} copyable>{"https://xdai.io/"+pk}</Paragraph>


       </div>
     )
   }
  }

  return (
    <span>
      {showButton}
      <Modal
        visible={open}
        title={
          <div>
            {selectedAddress ? <Address value={selectedAddress} ensProvider={props.ensProvider} /> : <Spin />}
          </div>
        }
        onOk={() => {
          setQr();
          setPK();
          setOpen(!open);
        }}
        onCancel={() => {
          setQr();
          setPK();
          setOpen(!open);
        }}
      >
        {display}
      </Modal>
    </span>
  );
}
