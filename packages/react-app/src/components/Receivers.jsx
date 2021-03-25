import React from 'react'
import LoginHeader from "./LoginHeader";
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import TwitterLogin from 'react-twitter-auth/lib/react-twitter-auth-component.js';
import { connect } from 'react-redux'
import { receiveGFT } from '../backend/gft';
import NFTList from './NFTList';
import { Avatar, Space, Button } from "antd";
import { TwitterOutlined } from '@ant-design/icons';

import { ethers, providers } from "ethers";

import { allNFTs } from '../helpers'
import NFTTabs from './NFTTabs';
import * as colors from '../themes/dark';

const API_HOST = (process.env.NODE_ENV == 'production') ? 'https://api.gft.art' : 'http://localhost:4000';

class Receivers extends React.Component {
  constructor() {
    super()
    const user = window.localStorage.getItem('gft-art:user');
    this.state = {
      isAuthenticated: window.localStorage.getItem('gft-art:authenticated') == "true",
      user: user && JSON.parse(user) || null, // user data
      token: window.localStorage.getItem('gft-art:token') || '',
      nftList: [],
      provider: null
    }
  }

  componentDidMount() {
    if (this.state.isAuthenticated) {
      this.getNftList();

      (async () => {
        if (!this.props.web3Modal || !this.props.web3Modal.cachedProvider) return

        const provider = new providers.Web3Provider(await this.props.web3Modal.connect())
        if (!provider) return

        this.setState({ provider })

      })()
    }
  }

  onSuccess = (response) => {
    const token = response.headers.get('x-auth-token');
    response.json().then(user => {
      if (token) {
        window.localStorage.setItem('gft-art:authenticated', true);
        window.localStorage.setItem('gft-art:user', JSON.stringify(user));
        window.localStorage.setItem('gft-art:token', token);
        this.setState({ isAuthenticated: true, user: user, token: token }, () => {
          this.getNftList();
        });
      }
    });
  };

  getNftList = () => {
    receiveGFT(this.state.user?.profile.username, this.state.user?.token, this.state.user?.tokenSecret).then((resp) => {
      if (resp.data) {
        console.log("[][][][][0", resp.data)
        this.setState({ nftList: resp.data.gfts });
      }
    });
  };

  onFailed = (error) => {
    alert(error);
  };

  logout = () => {
    window.localStorage.setItem('gft-art:authenticated', false);
    window.localStorage.setItem('gft-art:user', null);
    window.localStorage.setItem('gft-art:token', '');
    this.setState({ isAuthenticated: false, token: '', user: null })
  };

  render() {
    let content = this.state.isAuthenticated == true ?
      (
        <div>
          <Space align="center">
              <Avatar size="large" icon={<TwitterOutlined />} style={{ background: "transparent"}} />
              <div>
                @{this.state.user?.profile.username}
              </div>
              <Button style={{ verticalAlign: 'middle' }} onClick={this.logout}>
                Log out
                </Button>
          </Space>
          <div>
            <NFTTabs list={this.state.nftList} network={this.props.network} provider={this.state.provider} />
          </div>
        </div>
      ) :
      (
        <TwitterLogin
          text="Log in with Twitter"
          tag="button"
          style={{ color: '#381D2A', background: colors.YELLOW, borderRadius: 2, border: 'none' }}
          showIcon={true}
          loginUrl={`${API_HOST}/api/v1/auth/twitter`}
          onFailure={this.onFailed} onSuccess={this.onSuccess}
          requestTokenUrl={`${API_HOST}/api/v1/auth/twitter/reverse`} />
      );

    return (
      <div>
        <div>
          {content}
        </div>
      </div>
    )
  }
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Receivers)

