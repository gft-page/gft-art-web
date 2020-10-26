// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract Supporters {

    address public controller;

    constructor() public {
      controller = msg.sender;
    }

    event SupporterUpdate( address indexed supporter, bool isSupporter );

    mapping(address => bool) public isSupporter;

    function supporterUpdate(address supporter, bool update) public {
        require( msg.sender==controller, "supporterUpdate: not controller");
        require( supporter!=address(0), "supporterUpdate: zero address");
        isSupporter[supporter] = update;
        emit SupporterUpdate(supporter,isSupporter[supporter]);
    }

}
