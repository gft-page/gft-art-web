import React from 'react'
import { PageHeader } from 'antd';

export default function Header(props) {
  return (
    <div onClick={()=>{
      window.open("https://instantwallet.io");
    }}>
      <PageHeader
        title="🧙‍♂️ Instant Wallet"
        subTitle=""
        style={{cursor:'pointer'}}
      />
    </div>
  );
}
