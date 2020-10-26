import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title="🏰 Build Guild"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
