import React from 'react'
import LoginHeader from "./LoginHeader";
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import TwitterLogin from 'react-twitter-auth/lib/react-twitter-auth-component.js';
import { connect } from 'react-redux'

class Receivers extends React.Component {

    constructor() {
      super()
      this.state = {
        isAuthenticated: false, 
        user: null, 
        token: ''
      }
    }  
   
    onSuccess = (response) => {
      const token = response.headers.get('x-auth-token');
      response.json().then(user => {
        if (token) {
          this.setState({isAuthenticated: true, user: user, token: token});
        }
      });
    };
    
    onFailed = (error) => {
      alert(error);
    };    

    logout = () => {
      this.setState({isAuthenticated: false, token: '', user: null})
    };    

    render() {
      let content = !!this.state.isAuthenticated ?
      (
        <div>
          <p>Authenticated</p>
          <div>
            {this.state.user.email}
          </div>
          <div>
            <button onClick={this.logout} className="button" >
              Log out
            </button>
          </div>
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