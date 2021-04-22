import React from 'react'
import { Jumbotron } from 'react-bootstrap'

export default function AboutPage() {

  return (
    <div style={{ textAlign: 'center' }}>
      <h1><small><strong>About Us</strong></small></h1>
      <Jumbotron>
        <h2>
        <div>Twitter: <a href='https://twitter.com/gft_art'>@gft_art</a></div>
        <div>Discord: <a href='https://discord.gg/wCwAnCWjKp'>discord.gg/wCwAnCWjKp</a></div>
        <div>Medium: <a href='https://medium.com/@gftart'>@gftart</a></div>
        </h2>
      </Jumbotron>
    </div>
  )
}
