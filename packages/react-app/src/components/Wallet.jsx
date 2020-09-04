import React, { useState } from "react";
import { WalletOutlined, QrcodeOutlined, SendOutlined } from "@ant-design/icons";
import { Tooltip, Spin, Modal, Button, Row, Col } from "antd";
import QR from "qrcode.react";
import { parseEther } from "@ethersproject/units";
import { useUserAddress } from "eth-hooks";
import { Transactor } from "../helpers";
import { QRBlockie } from ".";
import Address from "./Address";
import Balance from "./Balance";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";

export default function Wallet(props) {
  const signerAddress = useUserAddress(props.provider);
  const selectedAddress = props.address || signerAddress;

  const [open, setOpen] = useState();
  const [qr, setQr] = useState();
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();

  const providerSend = props.provider ? (
    <Tooltip title="point camera phone at qr code">

      <QRBlockie {...props} />

      <div style={{
        cursor:"pointer",
        position:'fixed',
        width:"calc( 40px + 10vw )",
        height:"calc( 40px + 10vw )",
        textAlign:'center',
        right:-4,
        bottom:"2vw",
        padding:10,
        zIndex: 257,
        backgroundImage: "linear-gradient("+props.color1+", "+props.color2+")",
        backgroundColor: props.color1,
        borderRadius: "50%",
        boxShadow: "rgb(0, 0, 0) 0.3px 0.3px 3px"
      }}
        onClick={()=>{setOpen(!open)}}
      >
        <Row type="flex" align="middle" >
          <Col span={24} style={{zIndex:2}}>
            <SendOutlined style={{color:"#EDEDED",fontSize:"6vw",marginTop:"calc( 12px + 2vw )"}} rotate={0} />
          </Col>
        </Row>
      </div>

    </Tooltip>
  ) : (
    ""
  );

  let display;
  let receiveButton;
  if (qr) {
    display = (
      <QR
        value={selectedAddress}
        size="450"
        level="H"
        includeMargin
        renderAs="svg"
        imageSettings={{ excavate: false }}
      />
    );

  } else {
    const inputStyle = {
      padding: 10,
    };

    display = (
      <div>
        <div style={inputStyle}>
          <AddressInput
            autoFocus
            ensProvider={props.ensProvider}
            placeholder="to address"
            value={toAddress}
            onChange={setToAddress}
          />
        </div>
        <div style={inputStyle}>
          <EtherInput
            price={props.price}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
        </div>
      </div>
    );

  }

  return (
    <span>
      {providerSend}
      <Modal
        visible={open}
        title={
          <div>
            {selectedAddress ? <Address value={selectedAddress} ensProvider={props.ensProvider} /> : <Spin />}
            <div style={{ float: "right", paddingRight: 25 }}>
              <Balance address={selectedAddress} provider={props.provider} dollarMultiplier={props.price} />
            </div>
          </div>
        }
        onOk={() => {
          setQr();
          setOpen(!open);
        }}
        onCancel={() => {
          setQr();
          setOpen(!open);
        }}
        footer={[
          <Button
            key="submit"
            type="primary"
            disabled={!amount || !toAddress || qr}
            loading={false}
            onClick={() => {
              const tx = Transactor(props.provider);

              let value;
              try {
                value = parseEther("" + amount);
              } catch (e) {
                // failed to parseEther, try something else
                value = parseEther("" + parseFloat(amount).toFixed(8));
              }

              tx({
                to: toAddress,
                value,
              });
              setOpen(!open);
              setQr();
            }}
          >
            <SendOutlined /> Send
          </Button>,
        ]}
      >
        {display}
      </Modal>
    </span>
  );
}
