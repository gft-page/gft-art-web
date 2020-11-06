import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="/" >
      <PageHeader
        title="💰 Build Guild Support"
        subTitle="round 0 - mainnet"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
