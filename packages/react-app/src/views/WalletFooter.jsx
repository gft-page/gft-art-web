import React from "react";
import { Link } from "react-router-dom";
import { SettingOutlined, WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Menu, Affix } from "antd";

function WalletFooter({route}) {

  return (
            <Menu mode="horizontal" current={[route]} theme="dark" style={{textAlign: "center"}}>
              <Menu.Item key="wallet">
                <Link to="/wallet">
                  <WalletOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
              <Menu.Item key="receive">
                <Link to="/receive">
                  <QrcodeOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
              <Menu.Item key="settings">
                <Link to="/settings">
                  <SettingOutlined style={{fontSize: "64px", padding: "16px", margin:0}}/>
                </Link>
              </Menu.Item>
            </Menu>
  );
}

export default WalletFooter;
