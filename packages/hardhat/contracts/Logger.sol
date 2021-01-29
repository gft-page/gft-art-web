pragma solidity >=0.6.0 <0.7.0;

contract Logger {
  event Log(address caller, uint amount, string action);

  function log(address _caller, uint _amount, string memory _action) public {
    emit Log(_caller, _amount, _action);
  }
}