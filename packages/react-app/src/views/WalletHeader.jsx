import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Select } from "antd";
import Blockies from "react-blockies";
const { Option } = Select;

function WalletHeader({address, network, networks, handleChange}) {

  return (
          <Row align="middle" justify="center" gutter={12} style={{padding: 8}}>
              <Col span={8}>
              <Row align="middle" justify="center" gutter={4}>
                <Link style={{fontSize:60}} to="/wallet"><i class="nes-icon coin is-large"></i></Link>
              </Row>
              </Col>
              <Col span={8}>
              <Row align="middle" justify="center" gutter={4}>
                {(address ?
                    <Blockies seed={address.toLowerCase()} size={8} scale={8}/>
                  : <span>"Connecting..."</span>)}
              </Row>
              </Col>
              <Col span={8}>
                <Select defaultValue={network?networks[network].name:"mainnet"} style={{ width: 200 }} onChange={handleChange} size="large">
                          {Object.values(networks).map(n => (
                            <Option key={n.id}>{n.name}</Option>
                          ))}
                         </Select>
              </Col>
          </Row>
  );
}

export default WalletHeader;
