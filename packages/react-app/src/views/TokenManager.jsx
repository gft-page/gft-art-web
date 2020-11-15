import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Spin, Space, Table, Descriptions, Card, Form } from "antd";
const { Text } = Typography;

function TokenManager({network, networks, erc20s, myErc20s}) {

  let tokenColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Decimals',
    dataIndex: 'decimals',
    key: 'decimals',
  }]

  return (
              <Card style={{ margin: 'auto'}}>
                <Table
                rowKey="name"
                dataSource={networks[network].erc20s}
                columns={tokenColumns}
                />
              </Card>
  );
}

export default TokenManager;
