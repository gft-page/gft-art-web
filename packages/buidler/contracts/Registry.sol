// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {

  mapping (bytes32 => address) public assets;

  function updateAsset(bytes32 asset, address update) public onlyOwner {
    assets[asset] = update;
  }

}
