pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract YourContract {

  event SetPurpose(address sender, string purpose);

  string public purpose = "Programming Unstoppable Money";

  constructor() {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
    purpose = newPurpose;
    console.log(msg.sender,"set purpose to",purpose);
    emit SetPurpose(msg.sender, purpose);
  }

}
