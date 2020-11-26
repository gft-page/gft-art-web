import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Typography, Button, Spin, Space, Table, Descriptions, Card, Popconfirm, Divider } from "antd";
import { Ramp, GasGauge, PrivateKeyModal } from "../components";
const { Text, Title } = Typography;

function Settings({address, network, networks, gasPrice, price, setMyErc20s}) {

  let networkColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left'
  },
  {
    title: 'Color',
    dataIndex: 'color1',
    key: 'color1',
    render: text => <span style={{color:text}}>{text}</span>
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Blockexplorer',
    dataIndex: 'blockExplorer',
    key: 'blockExplorer',
    render: text => <a>{text}</a>,
    ellipsis: true,
  },
  {
    title: 'Node URL',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  }]

  return (
              <Card style={{ margin: 'auto', maxWidth: "100%"}}>
                    <PrivateKeyModal address={address}/>
                    {(network&&networks[network].blockExplorer&&address)?<a href={networks[network].blockExplorer+"address/"+address} target="_blank"><Button>Blockexplorer</Button></a>:null}
                    <Popconfirm
                        title="Are you sure you want to reset your token settings for all networks?"
                        onConfirm={() => {setMyErc20s({})}}
                        okText="Yes"
                        cancelText="No"
                      >
                    <Button>Reset tokens</Button>
                    </Popconfirm>
                    <Row align="middle" justify="center">
                    <Link to="/bridge-xdai" style={{margin: "12px"}}>{"Dai<>xDai bridge"}</Link>
                    </Row>
                <Divider/>
                <Table
                title={() => <Title level={4}>Network information</Title>}
                rowKey="name"
                dataSource={Object.values(networks)}
                columns={networkColumns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                expandable={{
                  expandedRowRender: record => <Descriptions>{
                    record.erc20s.map(
                      (r)=>
                        <Descriptions.Item label={r.name}>
                          {<a href={record.blockExplorer+"address/"+r.address} target="_blank">{r.address}</a>}
                        </Descriptions.Item>
                      )
                    }</Descriptions>,
                  rowExpandable: record => record.erc20s,
                }}
                />
              </Card>
  );
}

export default Settings;
