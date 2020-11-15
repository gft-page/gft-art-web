import React from "react";
import { Row, Col, Typography, Button, Spin, Space, Table, Descriptions, Card } from "antd";
import { Ramp, GasGauge, PrivateKeyModal } from "../components";
const { Text } = Typography;

function Settings({address, network, networks, gasPrice, price}) {

  let networkColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
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
    render: text => <a>{text}</a>
  },
  {
    title: 'Node URL',
    dataIndex: 'url',
    key: 'url',
    ellipsis: true
  }]

  return (
              <Card style={{ margin: 'auto'}}>
                <Row align="middle" justify="center" gutter={[8, 8]}>
                  <Space>
                    <PrivateKeyModal address={address}/>
                    {(network&&networks[network].blockExplorer&&address)?<a href={networks[network].blockExplorer+"address/"+address} target="_blank"><Button>Blockexplorer</Button></a>:null}
                  </Space>
                </Row>
                <Row align="middle" gutter={[8, 8]}>
                  <Col span={8}>
                    <Ramp price={(network&&networks[network].price)?networks[network].price:price} address={address} />
                  </Col>

                  <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
                    <GasGauge gasPrice={gasPrice} />
                  </Col>
                  <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
                    <Button
                      onClick={() => {
                        window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
                      }}
                      size="large"
                      shape="round"
                    >
                      <span style={{ marginRight: 8 }} role="img" aria-label="support">
                        💬
                      </span>
                      Support
                    </Button>
                  </Col>
                </Row>
                <Row>
                <Table
                rowKey="name"
                dataSource={Object.values(networks)}
                columns={networkColumns}
                pagination={false} 
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
                </Row>
              </Card>
  );
}

export default Settings;
