// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract Projects {

    address public controller;

    constructor() public {
      controller = msg.sender;
    }

    event ProjectUpdate( bytes32 id, string title, string desc, string repo, address owner );

    mapping (bytes32 => address) public owner;

    function projectId( string memory title ) public pure returns (bytes32) {
      // purposly don't include address(this)/chainid here so we can keep IDs through deployments?
      return keccak256(abi.encodePacked(title));
    }

    function updateProject(
        string memory title,
        string memory desc,
        string memory repo,
        address projectOwner
    ) public {
        bytes32 id = projectId(title);
        if( owner[id] == address(0) ){
          require( msg.sender == controller, "updateProject: NOT CONTROLLER");
        }else{
          require( msg.sender == owner[id] || msg.sender == controller, "updateProject: NOT OWNER OR CONTROLLER");
        }
        if( owner[id] != projectOwner){
          owner[id] = projectOwner;
        }
        emit ProjectUpdate(id, title, desc, repo, owner[id]);
    }

}
