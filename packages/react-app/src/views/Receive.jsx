import React from "react";
import { Row, Typography } from "antd";
import { QRBlockie } from "../components";
const { Text } = Typography;

function Receive({address}) {

  return (
              <>
              <QRBlockie address={address} />
              <Row align="middle" justify="center" gutter={[4, 4]}>
                <Text copyable ellipsis style={{fontSize: "28px", padding: 12}}>{address}</Text>
              </Row>
              </>
  );
}

export default Receive;
