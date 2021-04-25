import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from 'antd'

export default function RedeemGuide() {
  const [current, setCurrent] = useState(0);
  function onChange(data) {
    console.log(data)
    setCurrent(data)
  }
  return (
    <div>
        We've generated custodial wallets for your NFTs called "burners". Burner wallets
        are used for temporary storage but are not safe to keep your valuable assets in
        for a long time. Remember, <i><strong>"Not your keys, not your crypto!"</strong></i>
      <br></br>
      <br></br>
      <div>
        <NavLink to="/learn">
          <Button>Learn how to secure your NFTs</Button>
        </NavLink>
      </div>
      <br></br>
      <br></br>
    </div>
  )
}
