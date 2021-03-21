import React from 'react'
import { connect } from 'react-redux'
//import {fetchAccounts} from '../actions/fetchAccounts'
import Senders from '../components/Senders'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';

class SendersContainer extends React.Component {

    //componentDidMount() {
    //    this.props.fetchAccounts()
    //}

    render() {
        return (
            <Container>
                    <Jumbotron className="bg-light shadow-sm">
                <Senders {...this.props} />
                </Jumbotron>
            </Container>
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
export default connect(mapStateToProps,)(SendersContainer)