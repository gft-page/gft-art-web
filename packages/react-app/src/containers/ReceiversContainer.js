import React from 'react'
import { connect } from 'react-redux'
//import {fetchAccounts} from '../actions/fetchAccounts'
import Receivers from '../components/Receivers'
import RedeemGuide from '../components/RedeemGuide'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import * as colors from '../themes/dark';

class ReceiversContainer extends React.Component {

    //componentDidMount() {
    //    this.props.fetchAccounts()
    //}

    render() {
        return (
            <div>
                <Container>
                    <RedeemGuide />
                </Container>
                <Container fluid style={{ background: colors.LIGHT_PURPLE, paddingTop: 40, paddingBottom: 40 }}>
                    <Container>
                        <h1><small>Your GFT list ✨</small></h1>
                        <Receivers web3Modal={this.props.web3Modal} />
                    </Container>
                </Container>
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