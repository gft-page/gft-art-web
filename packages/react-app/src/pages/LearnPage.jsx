import React from 'react'
import { Container, Col, Jumbotron, Row } from 'react-bootstrap'

import * as colors from '../themes/dark'
import learnHeader from '../images/nft-basics.webp'

export default function LearnPage() {

  return (
    <div>
      <Container fluid style={{ textAlign: 'center', background: colors.LIGHT_PINK, paddingTop: 40, paddingBottom: 40 }}>
        <Container>
          <h1 style={{ color: colors.PURPLE }}><small>Redeeming your NFTs with a secure crypto wallet</small></h1>
          <img src={learnHeader} alt="NFT basics" />
        </Container>
      </Container>
      <Container>
        <br />
        <br />
        <h5><strong>Create a wallet</strong></h5>
        <p>
          Set up your own permanent crypto wallet to store your NFTs. <a href="https://metamask.io/">Try Metamask</a>.
        </p>
        <br />
        <br />
        <h5><strong>Get some ETH</strong></h5>
        <p>
          Fund your wallet to pay the "gas" fees to transfer assets like NFTs. <a href="https://support.mycrypto.com/general-knowledge/ethereum-blockchain/what-is-gas">Learn about gas on MyCrypto</a>.
        </p>
        <br />
        <br />
        <h5><strong>Secure your NFTs</strong></h5>
        <p>
          Transfer your NFT gifts to your own wallet to keep them safe. <a href="https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account">Import your account into Metamask</a>.
        </p>
        <br />
        <br />
      </Container>
      <Container fluid style={{ color: colors.PURPLE, background: colors.LIGHT_PINK, paddingTop: 40, paddingBottom: 40 }}>
        <br />
        <br />
        <Container style={{ color: colors.PURPLE }}>
          <h1 style={{ color: colors.PURPLE }}><small><strong>Minting and sending NFTs</strong></small></h1>
          <br />
          <br />
          <h5 style={{ color: colors.PURPLE }}><strong>Mint generic 721 or 1155 NFTs</strong></h5>
          <p>
            The most common NFTs follow one of two standards: ERC-721 and ERC-1155. You can mint these NFTs with your custom artwork or real-world assets on mintbase.io or rarible.
        </p>
          <br />
          <br />
          <h5 style={{ color: colors.PURPLE }}><strong>Mint Rarible or Zora NFTs</strong></h5>
          <p>
            Platforms like Rarible and Zora have their own custom contracts with features you may want for your NFTs.
        </p>
          <br />
          <br />
          <h5 style={{ color: colors.PURPLE }}><strong>Send your NFTs</strong></h5>
          <p>
            Sending your NFTs is easy with gft.art. Just click the Send tab, enter the NFT contract you are using, and add your recipients.
        </p>
          <br />
          <br />
        </Container>
      </Container>
      <footer className="text-center text-lg-start" style={{ textAlign: 'left' }}>
        <br />
        <br />
        <div className="container p-4">
          <Row>
            <div className="col-lg-6 col-md-12 mb-4 mb-md-0" style={{ textAlign: 'left' }}>
              <h5 className="text-uppercase">About</h5>
              <p>
                gft.art is a platform for airdropping NFTs. Learn more about us by following our social channels.
                © 2021
              </p>
            </div>
            <Col lg={3} md={6} className="mb-4 mb-md-0" style={{ textAlign: 'left' }}>
              <h5 class="text-uppercase">Updates</h5>
              <ul class="list-unstyled mb-0">
                <li>
                  <a href='https://discord.gg/wCwAnCWjKp' style={{ color: colors.YELLOW }}>discord.gg/wCwAnCWjKp</a>
                </li>
                <li>
                  Twitter: <a href='https://twitter.com/gft_art' style={{ color: colors.YELLOW }}>@gft_art</a>
                </li>
                <li>
                  Medium: <a href='https://medium.com/@gftart' style={{ color: colors.YELLOW }}>@gftart</a>
                </li>
              </ul>
            </Col>
            <Col lg={3} md={6} className="mb-4 mb-md-0" style={{ textAlign: 'left' }}>
              <h5 class="text-uppercase">Team</h5>
              <ul class="list-unstyled mb-0">
                <li>
                  <a href="https://linkedin.com/in/sashamack" style={{ color: colors.YELLOW }}>Sasha M</a>
                </li>
                <li>
                  <a href="https://twitter.com/invisLightNet" style={{ color: colors.YELLOW }}>@invisLightNet</a>
                </li>
                <li>
                  <a href="https://twitter.com/reaalkhalil" style={{ color: colors.YELLOW }}>@reaalkhalil</a>
                </li>
                <li>
                  <a href="https://twitter.com/v_stickykeys" style={{ color: colors.YELLOW }}>@v_stickykeys</a>
                </li>
                <li>
                  <a href="https://twitter.com/roxravago" style={{ color: colors.YELLOW }}>@roxravago</a>
                </li>
              </ul>
            </Col>
          </Row>
        </div>
        <br />
        <br />
      </footer>
    </div>
  )
}
