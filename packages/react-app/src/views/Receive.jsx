import React from "react";
import { Row, Typography } from "antd";
import { QRBlockie, Address } from "../components";
const { Text } = Typography;

function Receive({address, mainnetProvider}) {

  return (
              <>
              <QRBlockie address={address} />
              <Row align="middle" justify="center" gutter={[4, 4]}>
                <Text ellipsis copyable={{icon: <span class="nes-text is-primary">Copy</span>}} style={{fontSize: "28px", padding: 12}}>{address}</Text>
              </Row>
              </>
  );
}

export default Receive;
