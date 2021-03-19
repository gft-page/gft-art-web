import React from 'react'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { connect } from 'react-redux'

class Senders extends React.Component {

    constructor() {
      super()
      this.state = {
        email: '',
        username: '',
      }
    }  

    handleChange = event => {
      this.setState({
        [event.target.name]: event.target.value
      })
      console.log(this.state)
    }
  
    handleSubmit = event => {
      event.preventDefault()
      //this.props.createUser(this.state.name, this.props.accountDetail.address)
    }    

    render() {
      return (      
        <div>                 
            <h1><small>Senders Title</small></h1>                                                  
            <div>
              <Form onSubmit={ event => this.handleSubmit(event) }>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control name="email" type="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email} />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Name</Form.Label>
                  <Form.Control name="username" type="username" placeholder="Enter name" onChange={this.handleChange} value={this.state.username} />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check 
                    type="switch"
                    id="custom-switch"
                    label="Check this switch"
                  />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Example textarea</Form.Label>
                  <Form.Control as="textarea" rows={3} />
                </Form.Group>                
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>                 
            </div>                                                                                                                                   
        </div>
    )
  }
}

//export default connect(null,{createUser})(Senders)
export default connect(null)(Senders)