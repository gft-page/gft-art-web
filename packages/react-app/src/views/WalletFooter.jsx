import React from "react";
import { Link } from "react-router-dom";
import { SettingOutlined, WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Menu, Affix } from "antd";

function WalletFooter({route, network, networks}) {

  return (
            <Menu mode="horizontal" selectable={false} style={{textAlign: "center"}}>
              <Menu.Item key="wallet" style={{fontSize: "60px", margin: 16, width:"25%"}}>
                <Link to="/wallet">
                  <span style={{color: network?networks[network].color1:"black", margin: 16}}>$</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="receive" style={{fontSize: "60px", margin: 16, width:"25%"}}>
                <Link to="/receive">
                  <span style={{color: network?networks[network].color1:"black"}}>↓</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="settings" style={{fontSize: "60px", margin: 16, width:"25%"}}>
                <Link to="/settings">
                  <span style={{color: network?networks[network].color1:"black"}}>?</span>
                </Link>
              </Menu.Item>
            </Menu>
  );
}

export default WalletFooter;
