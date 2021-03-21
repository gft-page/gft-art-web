import React from 'react'

import "antd/dist/antd.css";
import { Form, Input, Button, Checkbox, Row, Col, Card } from "antd";

class SenderNFT extends React.Component {
    constructor() {
        super()
        this.state = {
            data: ''
        }

    }

    handleChange = event => {
        this.setState({
          data: event.target.value
        })
        this.props.onDataChange(this.props.id,this.state.data)
    }
    
    render() {
        return (
            <div>
                <div>
                    This is a sender component. Key is: {this.props.id}
                    <Form.Item
                      onChange={this.handleChange} value=""
                      label=""
                      name=""
                      >               
                      <Input name={this.props.id} placeholder="Enter NFT contract address" style={{ width: '50%' }}/>                           
                    </Form.Item>  
                </div>
            </div>
        )
    }
 }

 export default SenderNFT 
