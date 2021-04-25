import React from 'react'
import { connect } from 'react-redux'
//import {fetchAccounts} from '../actions/fetchAccounts'
import Receivers from '../components/Receivers'
import RedeemGuide from '../components/RedeemGuide'
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import * as colors from '../themes/dark';

class ReceiversContainer extends React.Component {
    render() {
        return (
            <div>
                <Container>
                    <h1><small><strong>Redeem your NFTs</strong></small></h1>
                    <RedeemGuide />
                </Container>
                <Container fluid style={{ background: colors.LIGHT_PURPLE, paddingTop: 40, paddingBottom: 40 }}>
                    <Container>
                        <h1><small>Your GFT list ✨</small></h1>
                        <Receivers web3Modal={this.props.web3Modal} network={this.props.network} />
                    </Container>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {}
}

export default connect(mapStateToProps,)(ReceiversContainer)