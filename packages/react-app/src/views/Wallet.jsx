import React from "react";
import { Link } from "react-router-dom";
//import 'antd/dist/antd.css'
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin } from "antd";
import { Faucet, Balance } from "../components";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { TokenBalance } from "."
const { Text } = Typography;

function Wallet({address, selectedProvider, yourBalance, network, networks, price, mainnetProvider, erc20s}) {

  return (
              <Row align="middle" justify="center">
                <Col>
                  <Row align="middle" justify="center">
                  <Balance address={address} provider={selectedProvider} size={60} />
                  {(yourBalance&&yourBalance.gt(0))?<Link to={"/send"}><button type="button" class="nes-btn is-primary">></button></Link>:null}
                  {(network&&networks[network].faucet&&yourBalance&&yourBalance.eq(0))?<a href={networks[network].faucet} target="_blank"><SmileOutlined style={{fontSize: "72px"}}/></a>:null}
                  </Row>
                  <Row align="middle" gutter={[4, 4]}>
                    <Col span={24}>
                      {

                        /*  if the local provider has a signer, let's show the faucet:  */
                        selectedProvider && selectedProvider.connection && selectedProvider.connection.url && selectedProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                          <Faucet localProvider={selectedProvider} price={price} ensProvider={mainnetProvider}/>
                        ) : (
                          ""
                        )
                      }
                    </Col>
                  </Row>
                  {(network&&networks[network].erc20s)?<List
                    itemLayout="horizontal"
                    size="large"
                    dataSource={(network&&networks[network].erc20s)?networks[network].erc20s:[]}
                    renderItem={item => {
                      return (
                      <List.Item>
                        <Row justify="center" align="middle" style={{width:"100%"}}>
                        {(erc20s&&erc20s[item.name])?<TokenBalance
                          name={item.name}
                          contract={erc20s[item.name]['contract']}
                          address={address}
                          decimals={erc20s[item.name]['decimals']} />:<Spin/>}
                        </Row>
                      </List.Item>)}}
                  />:null}
                </Col>
              </Row>
  );
}

export default Wallet;
