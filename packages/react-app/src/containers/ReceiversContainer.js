import React from 'react'
import { connect } from 'react-redux'
//import {fetchAccounts} from '../actions/fetchAccounts'
import Receivers from '../components/Receivers'
import RedeemGuide from '../components/RedeemGuide'
import Jumbotron from 'react-bootstrap/Jumbotron';

class ReceiversContainer extends React.Component {

    //componentDidMount() {
    //    this.props.fetchAccounts()
    //}

    render() {
        return (
            <div>
                    <Jumbotron className="bg-light shadow-sm">
                <RedeemGuide />
                <Receivers web3Modal={this.props.web3Modal} />
                </Jumbotron>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        //loading: state.loading,
        //accounts: state.accounts
    }
}

//export default connect(mapStateToProps, {fetchAccounts})(AccountsContainer)
export default connect(mapStateToProps,)(ReceiversContainer)