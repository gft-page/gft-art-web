pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract Registry {

  address public governor;

  constructor() public {
    governor = msg.sender;
  }

  mapping (bytes32 => address) public assets;

  function updateAsset(bytes32 asset, address update) public {
    require( msg.sender == governor , "NOT ALLOWED");
    assets[asset] = update;
  }

  function electGovernor(address newGovernor) public {
    require( msg.sender == governor , "NOT ALLOWED");
    governor = newGovernor;
  }

}
