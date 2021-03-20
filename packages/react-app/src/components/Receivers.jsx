import React from 'react'
import LoginHeader from "./LoginHeader";
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import TwitterLogin from 'react-twitter-auth/lib/react-twitter-auth-component.js';
import { connect } from 'react-redux'
import { receiveGFT } from '../backend/gft';
import NFTList from './NFTList';

class Receivers extends React.Component {

    constructor() {
      super()
      const user = window.localStorage.getItem('gft-art:user');
      this.state = {
        isAuthenticated: window.localStorage.getItem('gft-art:authenticated') || false,
        user: user && JSON.parse(user) || null, // user data
        token: window.localStorage.getItem('gft-art:token') || '',
        nftList: []
      }
    }

    componentDidMount() {
      if (this.state.isAuthenticated) {
        this.getNftList();
      }
    }
   
    onSuccess = (response) => {
      const token = response.headers.get('x-auth-token');
      response.json().then(user => {
        if (token) {
          window.localStorage.setItem('gft-art:authenticated', true);
          window.localStorage.setItem('gft-art:user', JSON.stringify(user));
          window.localStorage.setItem('gft-art:token', token);
          this.setState({isAuthenticated: true, user: user, token: token}, () => {
            this.getNftList();
          });
        }
      });
    };

    getNftList = () => {
      receiveGFT(this.state.user?.profile.username, this.state.user?.token, this.state.user?.tokenSecret).then((resp) => {
        if (resp.data) {
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
      this.setState({isAuthenticated: false, token: '', user: null})
    };    

    render() {
      let content = !!this.state.isAuthenticated ?
      (
        <div>
          <p>Logged in as:</p>
          <div>
            {this.state.user?.profile.username}
          </div>
          <div>
            <button onClick={this.logout} className="button" >
              Log out
            </button>
          </div>
          <NFTList list={this.state.nftList} network="rinkeby" />
        </div>
      ) :
      (
        <TwitterLogin loginUrl="http://localhost:4000/api/v1/auth/twitter"
                      onFailure={this.onFailed} onSuccess={this.onSuccess}
                      requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"/>
      );

      return (      
        <div>                 
            <h1><small>Receivers Title</small></h1>                                                  
            <div>
              {content}         
            </div>                                                                                                                                   
        </div>
    )
  }
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Receivers)